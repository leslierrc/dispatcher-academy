-- ============================================================
-- Migración: arregla "infinite recursion detected in policy for
-- relation profiles" (bug de la migración anterior)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro de correr más de una vez.
-- ============================================================

-- Causa: las políticas "admins read/update all profiles" comprobaban
-- "¿sos admin?" con una subconsulta directa a la propia tabla profiles,
-- dentro de una política DE profiles. Postgres tiene que re-evaluar esas
-- mismas políticas para resolver la subconsulta → recursión infinita.
-- Afectaba TODAS las lecturas de profiles, incluso el propio login.

-- Función que resuelve "¿el usuario actual es admin?" sin volver a pasar
-- por RLS (corre con los permisos del dueño de la tabla), rompiendo el ciclo.
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin_user());

drop policy if exists "admins update all profiles" on public.profiles;
create policy "admins update all profiles" on public.profiles
  for update using (public.is_admin_user()) with check (public.is_admin_user());

-- "users read own profile" también queda reescrita usando la función
-- (mismo resultado, pero evita repetir la subconsulta cruda).
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin_user());

-- Restringida al service role: nada en la app inserta perfiles a mano
-- (los crea el trigger handle_new_user, que ya evita RLS). Dejar esto
-- abierto a "true" para cualquier rol permitía insertar filas ajenas.
drop policy if exists "service role insert profiles" on public.profiles;
create policy "service role insert profiles" on public.profiles
  for insert to service_role with check (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

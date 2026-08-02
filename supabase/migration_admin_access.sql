-- ============================================================
-- Migración segura: corrige las políticas de RLS de profiles y
-- promociona al usuario indicado como admin.
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- Seguro de correr más de una vez.
-- ============================================================

-- 1) Evita la recursión infinita en las políticas de profiles.
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

drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "service role insert profiles" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;
drop policy if exists "admins update all profiles" on public.profiles;

create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin_user());

create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "service role insert profiles" on public.profiles
  for insert with check (true);

create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin_user());

create policy "admins update all profiles" on public.profiles
  for update using (public.is_admin_user()) with check (public.is_admin_user());

-- 2) Asegura que exista un perfil para los usuarios ya creados y lo corrige si falta.
insert into public.profiles (id, email, name, role, status)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'name', au.email),
  'student',
  'active'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;

-- 3) Corrige explícitamente el perfil del usuario indicado.
update public.profiles
set
  role = 'admin',
  status = 'active',
  name = coalesce(name, 'Leslier Rodriguez'),
  email = lower(email)
where lower(email) = lower('leslierrodriguezcontrera@gmail.com');

-- 4) Si por alguna razón no existe el perfil, lo crea con el id del usuario autenticado.
insert into public.profiles (id, email, name, role, status)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'name', au.email),
  'admin',
  'active'
from auth.users au
where lower(au.email) = lower('leslierrodriguezcontrera@gmail.com')
on conflict (id) do update set
  role = 'admin',
  status = 'active',
  name = coalesce(excluded.name, public.profiles.name),
  email = excluded.email;

-- ============================================================
-- Migración: arregla el bug que impedía volverte admin
-- Ejecutar en: Supabase Dashboard → SQL Editor (proyecto ya existente)
-- Seguro de correr más de una vez.
--
-- NOTA (post-mortem): las políticas "admins read/update all profiles"
-- de este archivo causaban "infinite recursion detected in policy for
-- relation profiles" (una política de profiles no puede consultar
-- profiles directamente). El arreglo está en
-- migration_fix_profiles_recursion.sql — hay que correr ese después.
-- ============================================================

-- 1) BUG REAL: el trigger que protege el perfil (para que un alumno no se
--    auto-asigne rol admin desde la app) también bloqueaba los cambios
--    hechos DIRECTO en Supabase (Table Editor / SQL Editor), porque en
--    esas conexiones auth.uid() es null y el trigger lo interpretaba
--    como "no es admin" y revertía el cambio en silencio. Por eso el
--    rol volvía a "student" aunque lo editaras a mano.
--    Esta versión sí permite los cambios directos en la base y solo
--    bloquea la auto-escalación de un usuario logueado sobre su propia fila.
create or replace function public.prevent_profile_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare is_admin boolean;
begin
  if auth.uid() is null then
    return new;
  end if;

  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) into is_admin;

  if not is_admin then
    new.role   = old.role;
    new.status = old.status;
    new.email  = old.email;
  end if;

  return new;
end;
$$;

-- 2) Otro bug: no existía ningún permiso para que un admin lea/edite el
--    perfil de OTRO usuario (solo el propio). Sin esto, Admin → Usuarios
--    sale vacío y "Cambiar rol"/"Suspender" no hacen nada.
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "admins update all profiles" on public.profiles;
create policy "admins update all profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Nota: el plan original incluía un paso 3 con
-- "alter database postgres set app.admin_emails = ...", pero Supabase
-- (proyecto hosted, no superusuario) da "permission denied to set
-- parameter" — no se puede fijar así. Por eso el ascenso automático a
-- admin al registrarte (vía ADMIN_EMAILS) no funciona en este plan; el
-- primer admin se promueve a mano con un UPDATE directo a profiles.role.

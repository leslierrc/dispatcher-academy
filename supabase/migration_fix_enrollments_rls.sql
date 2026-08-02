-- ============================================================
-- Migración: arregla "new row violates row-level security policy
-- for table enrollments" al inscribir/reinscribir un alumno.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro de correr más de una vez.
-- ============================================================

-- Causa: solo existía política de INSERT para admins en enrollments,
-- ninguna de UPDATE. "Inscribir alumno" ahora hace un upsert (para
-- poder subir/bajar el tier de alguien ya inscrito); cuando el alumno
-- ya tenía una fila, el upsert cae en el camino de UPDATE y no había
-- ninguna política que lo permitiera.
drop policy if exists "enrollments admin insert" on public.enrollments;
drop policy if exists "enrollments admin all" on public.enrollments;
create policy "enrollments admin all" on public.enrollments
  for all using (public.is_admin_user()) with check (public.is_admin_user());

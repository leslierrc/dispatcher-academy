-- ============================================================
-- Migración: proteger videos/PDFs + limpiar branding
-- Ejecutar en: Supabase Dashboard → SQL Editor (proyecto ya existente)
-- Seguro de correr más de una vez.
-- ============================================================

-- 1) El bucket de contenido deja de ser público. A partir de ahora
--    los videos y PDFs solo se sirven con URLs firmadas de corta
--    duración generadas por el servidor, después de comprobar que
--    el alumno está inscrito en el curso (o que es admin).
update storage.buckets set public = false where id = 'course-files';

-- 2) Elimina la política que permitía leer cualquier archivo del
--    bucket sin autenticación con solo conocer la URL.
drop policy if exists "course files public read" on storage.objects;

-- 3) Actualiza el nombre de marca guardado en Configuración por si
--    quedó con el valor antiguo "Dispatcher Academy".
update public.settings
set value = jsonb_set(value, '{brandName}', '"7 Digital LLC"')
where key = 'site' and value->>'brandName' = 'Dispatcher Academy';

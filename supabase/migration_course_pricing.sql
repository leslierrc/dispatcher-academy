-- ============================================================
-- Migración: precios por curso (básico/medio/pro) + tier en
-- inscripciones + límite de tamaño de archivo para videos largos.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro de correr más de una vez.
-- ============================================================

-- 1) Cada curso tiene sus propios 3 niveles de precio, ya no son
--    planes globales del sitio.
alter table public.plans add column if not exists course_id uuid references public.courses(id) on delete cascade;
alter table public.plans add column if not exists tier text check (tier in ('basico', 'medio', 'pro'));

-- Borra los 3 planes de ejemplo antiguos (Básico/Pro/VIP globales,
-- sin curso asociado): no tenían compras reales todavía.
delete from public.plans where course_id is null;

alter table public.plans drop constraint if exists plans_slug_key;
alter table public.plans drop constraint if exists plans_course_tier_unique;
alter table public.plans add constraint plans_course_tier_unique unique (course_id, tier);

-- 2) Crea los 3 niveles (básico/medio/pro) para cursos que ya existían
--    antes de este cambio y todavía no tienen ninguno (ej. "Dispatcher").
insert into public.plans (course_id, tier, name, slug, description, price, interval, features, badge, order_index)
select
  c.id,
  t.tier,
  t.name,
  c.slug || '-' || t.tier,
  t.description,
  0,
  'one_time',
  t.features,
  t.badge,
  t.order_index
from public.courses c
cross join (values
  ('basico', 'Básico', 'Lee los documentos y escucha el audio del curso.',
   '["Documentos del curso", "Audios del curso", "Acceso de por vida"]'::jsonb, null, 0),
  ('medio', 'Medio', 'Todo lo de Básico, más los videos del curso.',
   '["Todo lo de Básico", "Videos del curso"]'::jsonb, 'Recomendado', 1),
  ('pro', 'Pro', 'Todo lo de Medio, más mentoría 1:1 y descargas.',
   '["Todo lo de Medio", "Mentoría 1:1", "Descarga documentos y audios"]'::jsonb, null, 2)
) as t(tier, name, description, features, badge, order_index)
where not exists (select 1 from public.plans p where p.course_id = c.id);

-- 3) Crea un módulo "Contenido" para cursos que ya existían y todavía
--    no tienen ninguno (los que ya tienen módulos quedan como están).
insert into public.modules (course_id, title, order_index)
select c.id, 'Contenido', 0
from public.courses c
where not exists (select 1 from public.modules m where m.course_id = c.id);

-- 4) Nivel comprado por el alumno para ese curso puntual.
alter table public.enrollments add column if not exists tier text not null default 'basico'
  check (tier in ('basico', 'medio', 'pro'));

-- 5) Límite de tamaño de archivo del bucket: 2 GB (los videos de
--    Carla rondan los 500 MB). OJO: además de esto hay un límite
--    GLOBAL de subida por proyecto en Supabase → Settings → Storage
--    que puede ser más chico y gana si es menor a este valor — hay
--    que subirlo ahí también (a mano, no se puede desde SQL).
update storage.buckets set file_size_limit = 2147483648 where id = 'course-files';

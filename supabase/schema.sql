-- ============================================================
-- 7 Digital LLC — Esquema de base de datos (Supabase)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- EXTENSIONES
-- ────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────
-- PERFILES (extiende auth.users)
-- ────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text unique,
  role       text not null default 'student' check (role in ('admin','student')),
  status     text not null default 'active' check (status in ('active','suspended')),
  avatar_url text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: crea el perfil al registrarse un usuario nuevo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );

  -- NOTA: no hay ascenso automático a admin al registrarte. En Supabase
  -- hosted no se puede fijar la config de Postgres que necesitaría eso
  -- ("permission denied to set parameter"), así que el primer admin se
  -- promueve a mano después de registrarse:
  --   update public.profiles set role = 'admin' where email = 'correo@x.com';
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seguridad: impide que un usuario no-admin cambie su rol, estado o email
-- desde la app (auth.uid() = su propio id). Las conexiones sin JWT de
-- usuario (SQL Editor, Table Editor, o el service role) son de confianza
-- —quien tiene acceso directo a la base ya tiene control total— así que
-- esas SÍ pueden cambiar el rol libremente; solo se bloquea la
-- auto-escalación de un usuario autenticado sobre su propia fila.
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

drop trigger if exists profiles_no_escalation on public.profiles;
create trigger profiles_no_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_escalation();

-- ────────────────────────────────────────────────
-- HELPERS
-- ────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.slugify(text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      regexp_replace(trim($1), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
$$;

-- ────────────────────────────────────────────────
-- CATEGORÍAS
-- ────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- CURSOS
-- ────────────────────────────────────────────────
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,
  thumbnail_url text,
  price         numeric(10,2) not null default 0,
  published     boolean not null default false,
  featured      boolean not null default false,
  order_index   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at
  before update on public.courses
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────
-- MÓDULOS
-- ────────────────────────────────────────────────
create table if not exists public.modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  title        text not null,
  description  text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- LECCIONES
-- ────────────────────────────────────────────────
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules(id) on delete cascade,
  title            text not null,
  description      text,
  content          text,
  video_url        text,
  duration_minutes integer not null default 0,
  thumbnail_url    text,
  order_index      integer not null default 0,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists lessons_updated_at on public.lessons;
create trigger lessons_updated_at
  before update on public.lessons
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────
-- ARCHIVOS DESCARGABLES DE LECCIÓN (PDF, etc.)
-- ────────────────────────────────────────────────
create table if not exists public.lesson_files (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  name       text not null,
  url        text not null,
  type       text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- INSCRIPCIONES (curso comprado / asignado)
-- ────────────────────────────────────────────────
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  status      text not null default 'active',
  -- Nivel comprado para ESTE curso: define qué contenido puede ver.
  -- basico: lee documentos y escucha audio. medio: + ve los videos.
  -- pro: + descarga documentos/audio (el video nunca se descarga).
  tier        text not null default 'basico' check (tier in ('basico', 'medio', 'pro')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ────────────────────────────────────────────────
-- PROGRESO DEL ALUMNO
-- ────────────────────────────────────────────────
create table if not exists public.progress (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles(id) on delete cascade,
  lesson_id              uuid not null references public.lessons(id) on delete cascade,
  completed              boolean not null default false,
  completed_at           timestamptz,
  last_position_seconds  integer not null default 0,
  unique (user_id, lesson_id)
);

-- ────────────────────────────────────────────────
-- PLANES (pricing) — cada curso tiene sus propios 3 niveles
-- (básico/medio/pro), no son planes globales del sitio.
-- ────────────────────────────────────────────────
create table if not exists public.plans (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid references public.courses(id) on delete cascade,
  tier             text check (tier in ('basico', 'medio', 'pro')),
  name             text not null,
  slug             text not null,
  description      text,
  price            numeric(10,2) not null default 0,
  currency         text not null default 'usd',
  interval         text not null default 'one_time' check (interval in ('one_time','month','year')),
  stripe_price_id  text,
  features         jsonb not null default '[]'::jsonb,
  badge            text,
  active           boolean not null default true,
  order_index      integer not null default 0,
  created_at       timestamptz not null default now(),
  unique (course_id, tier)
);

-- ────────────────────────────────────────────────
-- SUSCRIPCIONES
-- ────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  plan_id                 uuid references public.plans(id) on delete set null,
  stripe_customer_id      text,
  stripe_subscription_id  text unique,
  status                  text not null default 'active',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Eventos Stripe (idempotencia de webhooks)
create table if not exists public.stripe_events (
  id         uuid primary key default gen_random_uuid(),
  event_id   text unique not null,
  type       text not null,
  payload    jsonb not null default '{}'::jsonb,
  processed  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- CONFIGURACIÓN DEL PANEL
-- ────────────────────────────────────────────────
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values ('site', '{
  "brandName": "7 Digital LLC",
  "supportEmail": "soporte@7digitalllc.com",
  "whatsapp": "",
  "instagram": "",
  "facebook": null,
  "youtube": null,
  "tiktok": null,
  "contactEmail": "hola@7digitalllc.com",
  "contactPhone": "",
  "address": ""
}'::jsonb)
on conflict (key) do nothing;

-- Nota: ya no hay planes globales de ejemplo. Los 3 niveles
-- (básico/medio/pro) se crean automáticamente al crear un curso
-- (ver createCourse en src/actions/admin.ts) y se editan desde el
-- propio curso en el panel admin.

-- ────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_files enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.settings enable row level security;

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

-- El propio usuario puede ver su perfil, y los admins pueden ver todos.
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin_user());
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "service role insert profiles" on public.profiles
  for insert with check (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Los admins pueden ver y editar el perfil de cualquier usuario.
create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin_user());
create policy "admins update all profiles" on public.profiles
  for update using (public.is_admin_user()) with check (public.is_admin_user());

-- El propio usuario puede ver sus inscripciones; solo admins (o webhook con
-- service role, que no pasa RLS) pueden crearlas/editarlas: evita
-- auto-inscripción. "admin all" cubre insert/update/delete —hace falta
-- update para poder subir/bajar el tier de un alumno ya inscrito.
create policy "enrollments own read" on public.enrollments
  for select using (auth.uid() = user_id);
create policy "enrollments admin all" on public.enrollments
  for all using (public.is_admin_user()) with check (public.is_admin_user());

create policy "progress own read" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress own upsert" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Planes son públicos
create policy "plans public read" on public.plans
  for select to authenticated, anon using (true);

-- Cursos publicados son públicos; el resto solo admin
create policy "courses public read" on public.courses
  for select to authenticated, anon
  using (published = true);
create policy "courses admin all" on public.courses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "categories public read" on public.categories
  for select to authenticated, anon using (true);
create policy "categories admin all" on public.categories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Módulos/lecciones: visibles si el curso está publicado o eres admin,
-- y solo a usuarios con el curso asignado (inscritos) para contenido completo.
create policy "modules read when enrolled or admin" on public.modules
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or
    exists (
      select 1
      from public.courses c
      left join public.enrollments e on e.course_id = c.id and e.user_id = auth.uid()
      where c.id = modules.course_id and (c.published = true or e.id is not null)
    )
  );
create policy "modules admin all" on public.modules
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "lessons read when enrolled or admin" on public.lessons
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or
    exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      left join public.enrollments e on e.course_id = c.id and e.user_id = auth.uid()
      where m.id = lessons.module_id and (c.published = true or e.id is not null)
    )
  );
create policy "lessons admin all" on public.lessons
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "files read when enrolled or admin" on public.lesson_files
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or
    exists (
      select 1
      from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.courses c on c.id = m.course_id
      left join public.enrollments e on e.course_id = c.id and e.user_id = auth.uid()
      where l.id = lesson_files.lesson_id and (c.published = true or e.id is not null)
    )
  );
create policy "files admin all" on public.lesson_files
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Suscripciones: solo el propio usuario o admin
create policy "subscriptions own read" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions admin all" on public.subscriptions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Configuración: lectura pública (colores, nombre), escritura solo admin
create policy "settings public read" on public.settings
  for select to authenticated, anon using (true);
create policy "settings admin write" on public.settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Stripe events: solo service role (no accesible por clientes)
create policy "stripe events service only" on public.stripe_events
  for all using (false);

-- ────────────────────────────────────────────────
-- STORAGE (videos, PDFs) — bucket privado.
-- El contenido NUNCA se sirve con URL pública: se accede solo
-- mediante URLs firmadas de corta duración generadas en el
-- servidor (service role) después de verificar que el alumno
-- está inscrito en el curso o que es admin.
-- ────────────────────────────────────────────────
-- file_size_limit en bytes: 2 GB, para los videos largos de Carla.
-- Ojo: además de esto, Supabase tiene un límite GLOBAL de subida por
-- proyecto en Dashboard → Settings → Storage que puede ser más chico
-- y gana si es menor a este valor — hay que subirlo ahí también.
insert into storage.buckets (id, name, public, file_size_limit)
values ('course-files', 'course-files', false, 2147483648)
on conflict (id) do update set public = false, file_size_limit = 2147483648;

create policy "course files admin upload" on storage.objects
  for insert with check (
    bucket_id = 'course-files'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "course files admin update" on storage.objects
  for update using (
    bucket_id = 'course-files'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "course files admin delete" on storage.objects
  for delete using (
    bucket_id = 'course-files'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ────────────────────────────────────────────────
-- VISTA ÚTIL: progreso por curso
-- ────────────────────────────────────────────────
create or replace view public.course_progress as
select
  p.user_id,
  m.course_id,
  count(distinct l.id) as total_lessons,
  count(distinct case when p.completed then p.lesson_id end) as completed_lessons,
  case
    when count(distinct l.id) = 0 then 0
    else round(100.0 * count(distinct case when p.completed then p.lesson_id end) / count(distinct l.id))
  end as percent
from public.progress p
join public.lessons l on l.id = p.lesson_id
join public.modules m on m.id = l.module_id
group by p.user_id, m.course_id;

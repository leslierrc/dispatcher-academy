-- ============================================================
-- Migración: limpia campos de "settings" que no se usaban en ningún
-- lado del sitio (logoUrl, primaryColor, accentColor).
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Seguro de correr más de una vez.
-- ============================================================

update public.settings
set value = value - 'logoUrl' - 'primaryColor' - 'accentColor'
where key = 'site';

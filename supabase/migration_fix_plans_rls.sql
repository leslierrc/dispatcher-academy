-- La tabla plans solo tenía política de lectura pública ("plans public
-- read"). Nunca hubo política de escritura para admin, así que
-- savePlan() (UPDATE desde el cliente autenticado normal, no
-- service-role) quedaba bloqueado por RLS en silencio: Supabase no
-- devuelve error en un UPDATE bloqueado por RLS, simplemente no
-- actualiza ninguna fila. Por eso el precio se quedaba en 0 sin ningún
-- mensaje de error visible. Mismo patrón que el fix de enrollments.
create policy "plans admin all" on public.plans
  for all using (public.is_admin_user()) with check (public.is_admin_user());

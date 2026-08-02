import { createAdminClient } from "@/lib/supabase/admin";

// El bucket "course-files" es privado. El contenido subido por el admin se
// guarda como una ruta interna (ej. "lessons/<id>/archivo.pdf"), nunca como
// URL pública. Esta ruta solo se convierte en un enlace usable mediante una
// URL firmada de corta duración, generada aquí con el service role.
const VIDEO_TTL_SECONDS = 60 * 60 * 3; // 3 horas: alcanza para ver la lección completa
const FILE_TTL_SECONDS = 60 * 10; // 10 minutos: solo el tiempo de abrir el visor

function isExternalUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value);
}

export async function resolveVideoUrl(rawValue: string | null): Promise<string | null> {
  if (!rawValue) return null;
  if (isExternalUrl(rawValue)) return rawValue;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("course-files")
    .createSignedUrl(rawValue, VIDEO_TTL_SECONDS);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function resolveFileUrl(rawValue: string, downloadName?: string): Promise<string | null> {
  if (isExternalUrl(rawValue)) return rawValue;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("course-files")
    .createSignedUrl(rawValue, FILE_TTL_SECONDS, downloadName ? { download: downloadName } : undefined);

  if (error || !data) return null;
  return data.signedUrl;
}

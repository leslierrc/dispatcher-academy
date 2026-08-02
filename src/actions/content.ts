"use server";

import { requireUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { resolveFileUrl } from "@/lib/protected-content";
import { getT } from "@/lib/locale";

// Genera una URL firmada nueva justo cuando el alumno hace clic en
// "Ver" o "Descargar", en vez de dejar una guardada en la página desde
// que cargó (así el enlace vive lo menos posible). La consulta usa el
// cliente autenticado normal: si RLS no le permite leer esa fila (no
// inscrito y no admin), no habrá archivo que resolver.
export async function getLessonFileViewUrl(fileId: string, wantDownload = false) {
  const [session, { t }] = await Promise.all([requireUser(), getT()]);
  const supabase = await createClient();

  const { data: file } = await supabase
    .from("lesson_files")
    .select("id, name, url, lesson:lesson_id(module:module_id(course_id))")
    .eq("id", fileId)
    .maybeSingle();

  if (!file) return { error: t.actions.content.noAccess };

  if (wantDownload && session.profile.role !== "admin") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courseId = (file as any).lesson?.module?.course_id as string | undefined;
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("tier")
      .eq("user_id", session.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (enrollment?.tier !== "pro") {
      return { error: t.actions.content.proRequired };
    }
  }

  const url = await resolveFileUrl(file.url, wantDownload ? file.name : undefined);
  if (!url) return { error: t.actions.content.linkFailed };

  return { url, name: file.name };
}

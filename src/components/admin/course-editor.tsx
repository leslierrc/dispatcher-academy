"use client";

import { useRef, useState, useTransition } from "react";
import {
  FileAudio,
  FileText,
  Film,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  createModule,
  deleteLesson,
  addLessonFile,
  deleteLessonFile,
  createUploadTicket,
  setLessonVideo,
  removeLessonVideo,
  quickCreateLesson,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LessonFormDialog from "@/components/admin/lesson-form-dialog";
import { cn } from "@/lib/utils";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { Course, Lesson, LessonFile } from "@/lib/types";

type ContentLesson = Lesson & { files?: LessonFile[] };

function contentTypeOf(lesson: ContentLesson): "video" | "audio" | "pdf" | "document" | "vacio" {
  if (lesson.video_url) return "video";
  const mime = lesson.files?.[0]?.type ?? "";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (lesson.files && lesson.files.length > 0) return "document";
  return "vacio";
}

const TYPE_ICON = { video: Film, audio: FileAudio, pdf: FileText, document: FileText, vacio: FileText };

// El visor protegido solo puede mostrar PDF e imágenes sin descargarlos
// (video tiene su propio reproductor). Word/PowerPoint/Excel no tienen
// forma de previsualizarse en el navegador, así que en vez de subirlos
// y que el alumno se los encuentre descargándose solos, se rechazan acá
// —el arrastrar-soltar no respeta el "accept" del input, hay que
// validarlo a mano.
function isAllowedType(file: File) {
  return (
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/") ||
    file.type.startsWith("image/") ||
    file.type === "application/pdf"
  );
}

// Sube directo del navegador a Supabase Storage (PUT a una URL firmada
// de un solo uso, pedida al servidor con el service role): no pasa por
// nuestro servidor de Next.js, así que no hay límite de tamaño de un
// Server Action. Usa XMLHttpRequest en vez de fetch porque es la única
// forma nativa del navegador de tener progreso real de subida y poder
// cancelarla a mitad de camino.
function uploadWithProgress(file: File, path: string, onProgress: (percent: number) => void) {
  let xhr: XMLHttpRequest | null = null;

  const promise = (async (): Promise<{ path?: string; error?: string }> => {
    const ticket = await createUploadTicket(path);
    if ("error" in ticket && ticket.error) return { error: ticket.error };

    return new Promise((resolve) => {
      xhr = new XMLHttpRequest();
      xhr.open("PUT", ticket.signedUrl!);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr!.status >= 200 && xhr!.status < 300) resolve({ path: ticket.path });
        else resolve({ error: `No se pudo subir el archivo (${xhr!.status}).` });
      };
      xhr.onerror = () => resolve({ error: "No se pudo subir el archivo (error de red)." });
      xhr.onabort = () => resolve({ error: "Subida cancelada" });

      const formData = new FormData();
      formData.append("cacheControl", "3600");
      formData.append("", file);
      xhr.send(formData);
    });
  })();

  return {
    promise,
    abort: () => xhr?.abort(),
  };
}

interface ActiveUpload {
  label: string;
  percent: number;
  abort: () => void;
}

export default function CourseEditor({
  course,
  moduleId,
  lessons,
}: {
  course: Course;
  moduleId: string | null;
  lessons: ContentLesson[];
}) {
  const { t } = useAppI18n();
  const TYPE_LABEL = {
    video: t.admin.content.typeVideo,
    audio: t.admin.content.typeAudio,
    pdf: t.admin.content.typePdf,
    document: t.admin.content.typeDocument,
    vacio: t.admin.content.typeEmpty,
  };
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; lesson: Lesson | null }>({
    open: false,
    lesson: null,
  });
  const [pending, startTransition] = useTransition();
  const [activeUpload, setActiveUpload] = useState<ActiveUpload | null>(null);
  const cancelledRef = useRef(false);
  const [dragOver, setDragOver] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const runUpload = (file: File, path: string) => {
    const { promise, abort } = uploadWithProgress(file, path, (percent) =>
      setActiveUpload((cur) => (cur ? { ...cur, percent } : cur)),
    );
    setActiveUpload({ label: file.name, percent: 0, abort });
    return promise.finally(() => setActiveUpload(null));
  };

  const handleFile = async (file: File, lessonId: string, name: string) => {
    const ext = file.name.split(".").pop() || "file";
    const path = `lessons/${lessonId}/${Date.now()}-${name}.${ext}`;
    const result = await runUpload(file, path);
    if (result.path) {
      const fd = new FormData();
      fd.set("lesson_id", lessonId);
      fd.set("name", name);
      fd.set("url", result.path);
      fd.set("type", file.type || ext);
      await addLessonFile(fd);
      return true;
    }
    return false;
  };

  const handleVideo = async (file: File, lessonId: string) => {
    const ext = file.name.split(".").pop() || "mp4";
    const path = `lessons/${lessonId}/video-${Date.now()}.${ext}`;
    const result = await runUpload(file, path);
    if (result.path) {
      await setLessonVideo(lessonId, result.path);
      return true;
    }
    return false;
  };

  // Un módulo "Contenido" se crea solo al crear el curso; esto es un
  // respaldo por si un curso viejo se quedó sin ninguno.
  const ensureModuleId = async (): Promise<string | null> => {
    if (moduleId) return moduleId;
    setPreparing(true);
    const fd = new FormData();
    fd.set("course_id", course.id);
    fd.set("title", "Contenido");
    await createModule(fd);
    setPreparing(false);
    return null; // la página se refresca sola vía revalidatePath; reintentar después
  };

  // Soltar (o elegir) uno o varios archivos: cada uno crea su propio
  // contenido (con el nombre del archivo como título) y sube el video,
  // audio, PDF o documento a ese contenido, todo en un solo paso.
  const handleDropFiles = async (allFiles: File[]) => {
    const files = allFiles.filter(isAllowedType);
    const skipped = allFiles.filter((f) => !isAllowedType(f)).map((f) => f.name);
    setRejected(skipped);

    if (files.length === 0) return;
    const targetModuleId = await ensureModuleId();
    if (!targetModuleId) return;

    cancelledRef.current = false;
    for (const file of files) {
      if (cancelledRef.current) break;
      const title = file.name.replace(/\.[^/.]+$/, "");
      const created = await quickCreateLesson(targetModuleId, title);
      const lessonId = "lessonId" in created ? created.lessonId : null;

      if (lessonId) {
        const ok = file.type.startsWith("video/")
          ? await handleVideo(file, lessonId)
          : await handleFile(file, lessonId, title);
        // Subida cancelada o fallida: no dejar un contenido vacío
        // ("Sin archivo") creado a mitad de camino.
        if (!ok) await deleteLesson(lessonId);
      }
    }
  };

  const cancelUpload = () => {
    cancelledRef.current = true;
    activeUpload?.abort();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.admin.content.title(course.title)}</h1>
        <p className="text-neutral-400">{t.admin.content.itemCount(lessons.length)}</p>
      </div>

      {activeUpload ? (
        <div className="flex flex-col gap-3 rounded-lg border-2 border-accent/40 bg-accent/5 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-text">{t.admin.content.uploading(activeUpload.label)}</span>
            <div className="flex items-center gap-3 flex-none">
              <span className="text-sm tabular-nums text-accent-300">{activeUpload.percent}%</span>
              <Button variant="outline" size="sm" onClick={cancelUpload}>
                <X className="h-4 w-4" />
                {t.admin.content.cancel}
              </Button>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${activeUpload.percent}%` }}
            />
          </div>
        </div>
      ) : (
        /* Arrastrar y soltar: crea el contenido y sube el archivo en un solo paso */
        <label
          htmlFor="drop-content"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length) handleDropFiles(files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragOver ? "border-accent bg-accent/10" : "border-divider hover:border-accent/50 hover:bg-surface",
          )}
        >
          <input
            type="file"
            id="drop-content"
            multiple
            accept="video/*,audio/*,application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) handleDropFiles(files);
              e.target.value = "";
            }}
          />
          {preparing ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-accent-300" />
              <span className="text-sm text-text">{t.admin.content.preparing}</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-7 w-7 text-accent-300" />
              <span className="text-sm text-text">{t.admin.content.dropzoneText}</span>
              <span className="text-xs text-neutral-500">{t.admin.content.dropzoneHint}</span>
            </>
          )}
        </label>
      )}

      {rejected.length > 0 && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {t.admin.content.rejectedFiles(rejected.join(", "))}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {lessons.map((lesson) => {
          const type = contentTypeOf(lesson);
          const Icon = TYPE_ICON[type];
          const hasUploadedVideo = !!lesson.video_url && !/^https?:\/\//i.test(lesson.video_url);
          const hasExternalVideo = !!lesson.video_url && /^https?:\/\//i.test(lesson.video_url);
          const uploadDisabled = !!activeUpload;

          return (
            <div key={lesson.id} className="rounded-lg border border-divider bg-surface/40">
              <div className="flex items-center gap-3 px-5 py-3.5">
                <Icon className="h-4.5 w-4.5 flex-none text-accent-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-text">{lesson.title}</span>
                    <Badge variant="neutral">{TYPE_LABEL[type]}</Badge>
                    {lesson.files && lesson.files.length > 1 && (
                      <Badge variant="neutral">{t.admin.content.filesCount(lesson.files.length)}</Badge>
                    )}
                    {!lesson.published && <Badge variant="warning">{t.admin.content.hidden}</Badge>}
                  </div>
                  {lesson.duration_minutes ? (
                    <div className="mt-0.5 text-xs text-neutral-500">{t.admin.content.minutes(lesson.duration_minutes)}</div>
                  ) : null}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLessonDialog({ open: true, lesson })}>
                  <Pencil className="h-4 w-4" />
                  {t.admin.content.edit}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  className="text-red-300 hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => {
                    if (confirm(t.admin.content.deleteConfirm(lesson.title))) {
                      startTransition(() => {
                        deleteLesson(lesson.id);
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-divider/50 px-5 py-2.5">
                <input
                  type="file"
                  accept="video/*"
                  id={`video-${lesson.id}`}
                  className="hidden"
                  disabled={uploadDisabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideo(file, lesson.id);
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor={`video-${lesson.id}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-neutral-300 hover:bg-surface transition-colors",
                    uploadDisabled ? "pointer-events-none opacity-50" : "cursor-pointer",
                  )}
                >
                  <Film className="h-3.5 w-3.5" />
                  {hasUploadedVideo ? t.admin.content.replaceVideo : t.admin.content.addVideo}
                </label>
                {hasUploadedVideo && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (confirm(t.admin.content.removeVideoConfirm)) {
                        startTransition(() => {
                          removeLessonVideo(lesson.id);
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    {t.admin.content.remove}
                  </button>
                )}
                {hasExternalVideo && <span className="text-xs text-neutral-500">{t.admin.content.externalLink}</span>}

                <span className="mx-1 h-4 w-px bg-divider" />

                <input
                  type="file"
                  id={`file-${lesson.id}`}
                  accept="audio/*,application/pdf,image/*"
                  className="hidden"
                  disabled={uploadDisabled}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, lesson.id, file.name.replace(/\.[^/.]+$/, ""));
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor={`file-${lesson.id}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-neutral-300 hover:bg-surface transition-colors",
                    uploadDisabled ? "pointer-events-none opacity-50" : "cursor-pointer",
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.admin.content.addFile}
                </label>

                {lesson.files && lesson.files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {lesson.files.map((f) => (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-bg px-2.5 py-1 text-[11px] text-neutral-400"
                      >
                        {f.name}
                        <button
                          onClick={() => startTransition(() => { deleteLessonFile(f.id); })}
                          className="text-neutral-500 hover:text-red-300 cursor-pointer"
                          aria-label={t.admin.content.removeFileLabel(f.name)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {lessons.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-500">{t.admin.content.empty}</p>
        )}
      </div>

      <LessonFormDialog
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog((prev) => ({ ...prev, open }))}
        moduleId={moduleId ?? ""}
        lesson={lessonDialog.lesson}
        t={t}
      />
    </div>
  );
}

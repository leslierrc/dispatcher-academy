"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import ReactPlayer from "react-player";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Film,
  List,
  Loader2,
  Lock,
} from "lucide-react";
import { toggleLessonComplete, saveLessonPosition } from "@/actions/courses";
import { getLessonFileViewUrl } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { Lesson, LessonFile } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

interface LessonPlayerProps {
  lesson: Lesson & { files: LessonFile[] };
  videoUrl: string | null;
  videoLocked: boolean;
  canDownload: boolean;
  viewerLabel: string;
  prev: Lesson | null;
  next: Lesson | null;
  isComplete: boolean;
  courseTitle: string;
}

function blockContextMenu(e: React.MouseEvent) {
  e.preventDefault();
}

// Solo PDF e imágenes se pueden mostrar dentro de un iframe: son los
// únicos formatos que el navegador sabe renderizar sin descargarlos.
// Word/PowerPoint/Excel no tienen visor nativo, así que el navegador
// los baja en vez de mostrarlos — mejor avisar claro que intentarlo.
function isPreviewable(type: string | null | undefined) {
  return !!type && (type === "application/pdf" || type.startsWith("image/"));
}

function Watermark({ label }: { label: string }) {
  return (
    <div className="pointer-events-none select-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-[-20%] flex flex-wrap content-around justify-around rotate-[-22deg]">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-6 py-5 text-xs font-medium text-white opacity-[0.16] mix-blend-difference"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LessonPlayer({
  lesson,
  videoUrl,
  videoLocked,
  canDownload,
  viewerLabel,
  prev,
  next,
  isComplete,
  courseTitle,
}: LessonPlayerProps) {
  const { t } = useAppI18n();
  const [completed, setCompleted] = useState(isComplete);
  const [pending, startTransition] = useTransition();
  const positionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [viewer, setViewer] = useState<{ open: boolean; url: string; name: string; loading: boolean; error: string | null }>({
    open: false,
    url: "",
    name: "",
    loading: false,
    error: null,
  });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const openFile = useCallback(async (file: LessonFile) => {
    if (!isPreviewable(file.type)) {
      setViewer({
        open: true,
        url: "",
        name: file.name,
        loading: false,
        error: t.lesson.unsupportedFile,
      });
      return;
    }
    setViewer({ open: true, url: "", name: file.name, loading: true, error: null });
    const result = await getLessonFileViewUrl(file.id);
    if ("error" in result && result.error) {
      setViewer({ open: true, url: "", name: file.name, loading: false, error: result.error });
      return;
    }
    setViewer({ open: true, url: result.url!, name: result.name ?? file.name, loading: false, error: null });
  }, [t]);

  const downloadFile = useCallback(async (file: LessonFile) => {
    setDownloadingId(file.id);
    const result = await getLessonFileViewUrl(file.id, true);
    if (result.url) window.location.href = result.url;
    setDownloadingId(null);
  }, []);

  const handleComplete = useCallback(() => {
    const nextValue = !completed;
    setCompleted(nextValue);
    startTransition(() => {
      toggleLessonComplete(lesson.id, nextValue);
    });
  }, [completed, lesson.id]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const playedSeconds = e.currentTarget.currentTime;
    if (playedSeconds < 5) return;
    if (positionTimer.current) clearTimeout(positionTimer.current);
    positionTimer.current = setTimeout(() => {
      saveLessonPosition(lesson.id, playedSeconds);
    }, 5000);
  }, [lesson.id]);

  const handleEnded = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      startTransition(() => {
        toggleLessonComplete(lesson.id, true);
      });
    }
  }, [completed, lesson.id]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6 min-w-0">
        {/* Video */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-lg border border-divider bg-black"
          onContextMenu={blockContextMenu}
        >
          {videoUrl ? (
            <>
              <ReactPlayerAny
                src={videoUrl}
                width="100%"
                height="100%"
                controls
                playing={false}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onContextMenu={blockContextMenu}
                config={{
                  youtube: { modestbranding: 1, rel: 0 },
                }}
              />
              <Watermark label={viewerLabel} />
            </>
          ) : videoLocked ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-400">
              <Lock className="h-10 w-10 text-accent-300/60" />
              <span className="text-sm text-text">{t.lesson.videoLocked}</span>
              <span className="text-xs text-neutral-500">{t.lesson.upgradeToWatch}</span>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-500">
              <Film className="h-10 w-10 text-accent-300/60" />
              <span className="text-sm">{t.lesson.noVideo}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral">{courseTitle}</Badge>
            {lesson.duration_minutes ? (
              <Badge variant="neutral">{lesson.duration_minutes} min</Badge>
            ) : null}
          </div>
          <h1 className="mt-3 font-heading text-2xl text-text leading-tight">{lesson.title}</h1>
          {lesson.description && <p className="mt-3 text-neutral-300 leading-relaxed">{lesson.description}</p>}
          {lesson.content && (
            <div className="mt-4 text-neutral-300 leading-relaxed whitespace-pre-wrap">{lesson.content}</div>
          )}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between gap-3 border-t border-divider pt-5">
          {prev ? (
            <Link href={`/dashboard/lessons/${prev.id}`}>
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4" />
                {t.lesson.previous}
              </Button>
            </Link>
          ) : (
            <span />
          )}
          <Button variant={completed ? "outline" : "default"} onClick={handleComplete} disabled={pending}>
            <CheckCircle2 className="h-4 w-4" />
            {completed ? t.lesson.completed : t.lesson.markComplete}
          </Button>
          {next ? (
            <Link href={`/dashboard/lessons/${next.id}`}>
              <Button>
                {t.lesson.next}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/courses">
              <Button variant="outline">
                <List className="h-4 w-4" />
                {t.lesson.courses}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recursos de la lección */}
      <aside className="flex flex-col gap-4">
        <div className="rounded-lg border border-divider bg-surface/40 p-5">
          <h2 className="font-heading text-lg text-text">{t.lesson.resourcesTitle}</h2>
          {lesson.files && lesson.files.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2.5">
              {lesson.files.map((file) => (
                <li key={file.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openFile(file)}
                    className="flex flex-1 min-w-0 items-center gap-3 rounded-md border border-divider bg-bg px-3.5 py-3 text-left transition-colors hover:border-accent/40 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 flex-none text-accent-300" />
                    <span className="flex-1 truncate text-sm text-text">{file.name}</span>
                    <Eye className="h-4 w-4 flex-none text-neutral-500" />
                  </button>
                  {canDownload && (
                    <button
                      type="button"
                      title={t.lesson.download}
                      onClick={() => downloadFile(file)}
                      disabled={downloadingId === file.id}
                      className="flex-none rounded-md border border-divider bg-bg p-3 text-neutral-400 hover:border-accent/40 hover:text-accent-300 cursor-pointer disabled:opacity-60"
                    >
                      {downloadingId === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">{t.lesson.noFiles}</p>
          )}
        </div>
      </aside>

      <Dialog open={viewer.open} onOpenChange={(open) => setViewer((v) => ({ ...v, open }))}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] h-[85vh] flex flex-col p-4">
          <DialogHeader className="mb-2">
            <DialogTitle className="truncate pr-8">{viewer.name}</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 overflow-hidden rounded-md border border-divider bg-white" onContextMenu={blockContextMenu}>
            {viewer.loading && (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {viewer.error && (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-400">
                {viewer.error}
              </div>
            )}
            {!viewer.loading && !viewer.error && viewer.url && (
              <>
                <iframe
                  src={`${viewer.url}#toolbar=0&navpanes=0`}
                  className="h-full w-full"
                  title={viewer.name}
                />
                {/* Chrome/Edge muestran su propio botón de descarga sobre el
                    visor de PDF y en versiones recientes ignoran el
                    "#toolbar=0" que debería ocultarlo. Esta capa invisible
                    tapa esa esquina para que el clic no le llegue al botón
                    nativo (no es infalible: ver aviso al usuario). */}
                <div
                  className="absolute right-0 top-0 z-20 h-13 w-52"
                  onContextMenu={blockContextMenu}
                  title=""
                />
                <Watermark label={viewerLabel} />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

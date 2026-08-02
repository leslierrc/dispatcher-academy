"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createLesson, updateLesson, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Lesson } from "@/lib/types";

const initialState: ActionState = {};

export default function LessonFormDialog({
  open,
  onOpenChange,
  moduleId,
  lesson,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  lesson: Lesson | null;
}) {
  const [state, action, pending] = useActionState(
    (prev: ActionState, fd: FormData) =>
      lesson ? updateLesson(lesson.id, prev, fd) : createLesson(moduleId, prev, fd),
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson ? "Editar lección" : "Nueva lección"}</DialogTitle>
          <DialogDescription>
            Configura el video, descripción, contenido y archivos de la lección.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {state.error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-title">Título</Label>
            <Input id="lesson-title" name="title" defaultValue={lesson?.title ?? ""} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-desc">Descripción corta</Label>
            <Textarea id="lesson-desc" name="description" defaultValue={lesson?.description ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-video">Enlace de video externo (opcional)</Label>
            <Input
              id="lesson-video"
              name="video_url"
              defaultValue={lesson?.video_url && /^https?:\/\//i.test(lesson.video_url) ? lesson.video_url : ""}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-neutral-500">
              Solo para YouTube/Vimeo. Para subir el archivo de video directamente, guarda la lección y usa
              &quot;Subir video&quot; en la lista de módulos.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-content">Contenido / texto</Label>
            <Textarea
              id="lesson-content"
              name="content"
              defaultValue={lesson?.content ?? ""}
              rows={5}
              placeholder="Puedes escribir el guion de la lección o contenido complementario."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-duration">Duración (minutos)</Label>
            <Input
              id="lesson-duration"
              name="duration_minutes"
              type="number"
              min={0}
              defaultValue={lesson?.duration_minutes ?? 0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-thumb">URL de miniatura</Label>
            <Input id="lesson-thumb" name="thumbnail_url" defaultValue={lesson?.thumbnail_url ?? ""} />
          </div>

          <label className="flex items-center gap-2.5 rounded-md border border-divider bg-surface px-3.5 py-3 text-sm text-text cursor-pointer">
            <input type="checkbox" name="published" value="true" defaultChecked={lesson?.published ?? true} className="accent-accent" />
            Publicada
          </label>

          <Button type="submit" disabled={pending} className="mt-1">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {lesson ? "Guardar cambios" : "Crear lección"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

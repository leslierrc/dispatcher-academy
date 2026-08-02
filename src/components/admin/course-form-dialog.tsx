"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createCourse, updateCourse, type ActionState } from "@/actions/admin";
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
import type { Course } from "@/lib/types";

const initialState: ActionState = {};

export default function CourseFormDialog({
  open,
  onOpenChange,
  course,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
}) {
  const [state, action, pending] = useActionState(
    (prev: ActionState, fd: FormData) => (course ? updateCourse(course.id, prev, fd) : createCourse(prev, fd)),
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Editar curso" : "Nuevo curso"}</DialogTitle>
          <DialogDescription>
            {course ? "Actualiza la información del curso." : "Crea un nuevo curso con sus módulos y lecciones."}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {state.error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300">
              {state.success}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={course?.title ?? ""} required placeholder="Curso de Dispatch Profesional" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" defaultValue={course?.description ?? ""} placeholder="¿Qué aprenderá el alumno?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={course?.price ?? 0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category_id">Categoría ID</Label>
              <Input id="category_id" name="category_id" defaultValue={course?.category_id ?? ""} placeholder="uuid opcional" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="thumbnail_url">URL de miniatura</Label>
            <Input id="thumbnail_url" name="thumbnail_url" defaultValue={course?.thumbnail_url ?? ""} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 rounded-md border border-divider bg-surface px-3.5 py-3 text-sm text-text cursor-pointer">
              <input type="checkbox" name="published" value="true" defaultChecked={course?.published ?? false} className="accent-accent" />
              Publicado
            </label>
            <label className="flex items-center gap-2.5 rounded-md border border-divider bg-surface px-3.5 py-3 text-sm text-text cursor-pointer">
              <input type="checkbox" name="featured" value="true" defaultChecked={course?.featured ?? false} className="accent-accent" />
              Destacado
            </label>
          </div>

          <Button type="submit" disabled={pending} className="mt-1">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {course ? "Guardar cambios" : "Crear curso"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

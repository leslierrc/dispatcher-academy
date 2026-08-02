"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toggleCourseStatus, deleteCourse, duplicateCourse } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CourseFormDialog from "@/components/admin/course-form-dialog";
import type { Course } from "@/lib/types";

export default function CoursesManager({ courses }: { courses: Course[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-text">Cursos</h1>
          <p className="mt-1 text-neutral-400">
            Crea, edita, publica y organiza tus programas. {courses.length} cursos en total.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo curso
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-col gap-4 rounded-lg border border-divider bg-surface/40 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-full sm:w-36 flex-none overflow-hidden rounded-md bg-neutral-800">
              {course.thumbnail_url ? (
                <Image src={course.thumbnail_url} alt={course.title} fill sizes="144px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-500">Sin imagen</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-lg text-text truncate">{course.title}</h3>
                <Badge variant={course.published ? "success" : "neutral"}>
                  {course.published ? "Publicado" : "Oculto"}
                </Badge>
                {course.featured && <Badge>Destacado</Badge>}
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-neutral-400">
                {course.description || "Sin descripción"}
              </p>
              <div className="mt-1 text-xs text-neutral-500">
                {course.price ? `$${course.price}` : "Gratis"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/admin/courses/${course.id}`}>
                <Button variant="outline" size="sm">
                  <Layers className="h-4 w-4" />
                  Módulos
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(course);
                  setDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    toggleCourseStatus(course.id, !course.published);
                  })
                }
              >
                {course.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    duplicateCourse(course.id);
                  })
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                className="text-red-300 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => {
                  if (confirm(`¿Eliminar "${course.title}"? Se borrarán módulos y lecciones.`)) {
                    startTransition(() => {
                      deleteCourse(course.id);
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="rounded-lg border border-dashed border-divider py-16 text-center text-neutral-500">
            No hay cursos todavía. Crea el primero.
          </div>
        )}
      </div>

      <CourseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} course={editing} />
    </div>
  );
}

import { requireUser } from "@/lib/auth-helpers";
import { getEnrolledCourses, getPublishedCourses } from "@/lib/data";
import CourseCard from "@/components/dashboard/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default async function MyCoursesPage() {
  const user = await requireUser();
  const [enrolled, catalog] = await Promise.all([
    getEnrolledCourses(user.id),
    getPublishedCourses(),
  ]);

  const enrolledIds = new Set(enrolled.map((c) => c.id));
  const available = catalog.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl text-text">Mis Cursos</h1>
        <p className="mt-1 text-neutral-400">Continúa donde lo dejaste o descubre nuevos programas.</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-accent-300">En progreso</h2>
        {enrolled.length === 0 ? (
          <Card>
            <CardContent className="pt-10 pb-10 text-center text-neutral-400 text-sm">
              Todavía no tienes cursos asignados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrolled.map((course) => (
              <CourseCard key={course.id} course={course} userId={user.id} />
            ))}
          </div>
        )}
      </section>

      {available.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-300" />
            <h2 className="font-heading text-xl text-text">Catálogo disponible</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((course) => (
              <Link
                key={course.id}
                href="/#precios"
                className="group flex flex-col overflow-hidden rounded-lg border border-divider bg-surface/60 transition-all hover:border-accent/40 hover:-translate-y-0.5"
              >
                <div className="relative aspect-video w-full bg-neutral-800">
                  <div className="flex h-full items-center justify-center">
                    <Sparkles className="h-10 w-10 text-accent-300/50" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-heading text-lg text-text leading-snug line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-neutral-400 line-clamp-2">
                    {course.description || "Descubre este programa completo."}
                  </p>
                  <span className="mt-auto inline-flex h-8 items-center justify-center rounded-md border border-accent px-3 text-xs font-heading font-semibold text-accent-300">
                    Ver plan
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

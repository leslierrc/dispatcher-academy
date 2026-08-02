import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { getCourseModules, getCourseProgress } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/types";

export default async function CourseCard({
  course,
  userId,
}: {
  course: Course;
  userId: string;
}) {
  const [modules, progress] = await Promise.all([
    getCourseModules(course.id),
    getCourseProgress(userId),
  ]);

  const lessons = modules.flatMap((m) => m.lessons);
  const total = lessons.length;
  const completed = lessons.filter((l) => progress[l.id]).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Link
      href={`/dashboard/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-divider bg-surface/60 transition-all hover:border-accent/40 hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlayCircle className="h-10 w-10 text-accent-300/60" />
          </div>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-heading text-accent-300 backdrop-blur">
          {percent}%
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg text-text leading-snug line-clamp-2">{course.title}</h3>
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{total} lecciones</span>
          <span>
            {completed}/{total} completadas
          </span>
        </div>
        <Progress value={percent} />
        <span
          className={
            percent === 100
              ? "mt-1 inline-flex h-8 items-center justify-center rounded-md border border-accent px-3 text-xs font-heading font-semibold text-accent-300"
              : "mt-1 inline-flex h-8 items-center justify-center rounded-md bg-accent px-3 text-xs font-heading font-semibold text-white"
          }
        >
          {percent === 0 ? "Comenzar" : percent === 100 ? "Repasar" : "Continuar"}
        </span>
      </div>
    </Link>
  );
}

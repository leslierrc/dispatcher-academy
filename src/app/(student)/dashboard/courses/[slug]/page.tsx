import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, FileText, Film, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getCourseWithModules, getCourseProgress, getCoursePlans } from "@/lib/data";
import { getT } from "@/lib/locale";
import { Progress } from "@/components/ui/progress";
import CourseLockedNotice from "@/components/dashboard/course-locked-notice";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const { t } = await getT();

  const course = await getCourseWithModules(slug);
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  const isEnrolled = !!enrollment;
  const progress = await getCourseProgress(user.id);

  const lessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const total = lessons.length;
  const completed = lessons.filter((l) => progress[l.id]).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  if (!isEnrolled) {
    const plans = await getCoursePlans(course.id);
    return <CourseLockedNotice course={{ ...course, plans: plans.filter((p) => p.active) }} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-divider bg-neutral-800">
          {course.thumbnail_url ? (
            <Image src={course.thumbnail_url} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 28rem" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <PlayCircle className="h-12 w-12 text-accent-300/50" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="font-heading text-3xl text-text leading-tight">{course.title}</h1>
          <p className="text-neutral-300">{course.description}</p>
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <span>{total} {t.courseDetail.lessons}</span>
            <span>·</span>
            <span>{completed} {t.courseDetail.completedCount}</span>
          </div>
          <div className="max-w-md">
            <Progress value={percent} />
            <span className="mt-1 block text-xs text-accent-300">{percent}% {t.courseDetail.percentCompleted}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {course.modules?.map((module, mi) => {
          const moduleLessons = module.lessons ?? [];
          const moduleDone = moduleLessons.filter((l) => progress[l.id]).length;
          return (
            <div key={module.id} className="overflow-hidden rounded-lg border border-divider bg-surface/40">
              <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 font-heading text-sm text-accent-300">
                    {mi + 1}
                  </span>
                  <h2 className="font-heading text-lg text-text">{module.title}</h2>
                </div>
                <span className="text-xs text-neutral-400">
                  {moduleDone}/{moduleLessons.length} {t.courseDetail.lessons}
                </span>
              </div>
              <ul className="flex flex-col">
                {moduleLessons.map((lesson) => {
                  const done = !!progress[lesson.id];
                  return (
                    <li key={lesson.id} className="border-b border-divider/50 last:border-b-0">
                      <Link
                        href={`/dashboard/lessons/${lesson.id}`}
                        className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-accent/5"
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 flex-none text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 flex-none text-neutral-600" />
                        )}
                        <span className="flex-1 text-sm text-text">{lesson.title}</span>
                        <span className="flex items-center gap-3 text-xs text-neutral-500">
                          {lesson.video_url && <Film className="h-3.5 w-3.5" />}
                          {lesson.files && lesson.files.length > 0 && <FileText className="h-3.5 w-3.5" />}
                          {lesson.duration_minutes ? `${lesson.duration_minutes} min` : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

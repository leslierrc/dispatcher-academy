import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getLessonWithModule, getCourseModules, getCourseProgress } from "@/lib/data";
import { resolveVideoUrl } from "@/lib/protected-content";
import LessonPlayer from "@/components/dashboard/lesson-player";
import type { Lesson } from "@/lib/types";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const lesson = await getLessonWithModule(id);
  if (!lesson) notFound();

  const isAdmin = user.profile.role === "admin";
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("tier")
    .eq("user_id", user.id)
    .eq("course_id", lesson.module.course_id)
    .maybeSingle();

  if (!enrollment && !isAdmin) redirect("/dashboard/courses");

  const tier = isAdmin ? "pro" : (enrollment?.tier ?? "basico");
  const canWatchVideo = tier === "medio" || tier === "pro";
  const canDownload = tier === "pro";

  const modules = await getCourseModules(lesson.module.course_id);
  const allLessons = modules.flatMap((m) => m.lessons as Lesson[]);
  const index = allLessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? allLessons[index - 1] : null;
  const next = index < allLessons.length - 1 ? allLessons[index + 1] : null;

  const progress = await getCourseProgress(user.id);
  const videoLocked = !!lesson.video_url && !canWatchVideo;
  const videoUrl = videoLocked ? null : await resolveVideoUrl(lesson.video_url);

  return (
    <LessonPlayer
      lesson={{ ...lesson, files: lesson.files ?? [] }}
      videoUrl={videoUrl}
      videoLocked={videoLocked}
      canDownload={canDownload}
      viewerLabel={user.email ?? user.profile?.name ?? "Alumno"}
      prev={prev}
      next={next}
      isComplete={!!progress[lesson.id]}
      courseTitle={lesson.module.title}
    />
  );
}

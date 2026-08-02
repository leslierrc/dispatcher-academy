"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import CoursePlansDialog from "@/components/dashboard/course-plans-dialog";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { Course } from "@/lib/types";

export default function CourseLockedNotice({ course }: { course: Course }) {
  const { t } = useAppI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <Lock className="h-12 w-12 text-accent-300" />
      <h1 className="font-heading text-3xl text-text">{t.courseLocked.title}</h1>
      <p className="max-w-md text-neutral-400">{t.courseLocked.body(course.title)}</p>
      <Button onClick={() => setOpen(true)}>{t.courseLocked.viewPlans}</Button>
      <CoursePlansDialog course={course} open={open} onOpenChange={setOpen} t={t} />
    </div>
  );
}

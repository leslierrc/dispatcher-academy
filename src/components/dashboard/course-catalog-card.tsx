"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import CoursePlansDialog from "@/components/dashboard/course-plans-dialog";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { Course } from "@/lib/types";

export default function CourseCatalogCard({ course }: { course: Course }) {
  const { t } = useAppI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-col overflow-hidden rounded-lg border border-divider bg-surface/60 text-left transition-all hover:border-accent/40 hover:-translate-y-0.5 cursor-pointer"
      >
        <div className="relative aspect-video w-full bg-neutral-800">
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-10 w-10 text-accent-300/50" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-heading text-lg text-text leading-snug line-clamp-2">{course.title}</h3>
          <p className="text-sm text-neutral-400 line-clamp-2">
            {course.description || t.courses.discoverProgram}
          </p>
          <span className="mt-auto inline-flex h-8 items-center justify-center rounded-md border border-accent px-3 text-xs font-heading font-semibold text-accent-300">
            {t.courses.viewPlans}
          </span>
        </div>
      </button>

      <CoursePlansDialog course={course} open={open} onOpenChange={setOpen} t={t} />
    </>
  );
}

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
import type { AppT } from "@/i18n/app";

const initialState: ActionState = {};

export default function LessonFormDialog({
  open,
  onOpenChange,
  moduleId,
  lesson,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  lesson: Lesson | null;
  t: AppT;
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
          <DialogTitle>{lesson ? t.admin.lessonForm.editTitle : t.admin.lessonForm.newTitle}</DialogTitle>
          <DialogDescription>{t.admin.lessonForm.subtitle}</DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          {state.error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-title">{t.admin.lessonForm.title}</Label>
            <Input id="lesson-title" name="title" defaultValue={lesson?.title ?? ""} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-desc">{t.admin.lessonForm.shortDescription}</Label>
            <Textarea id="lesson-desc" name="description" defaultValue={lesson?.description ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-video">{t.admin.lessonForm.externalVideoLink}</Label>
            <Input
              id="lesson-video"
              name="video_url"
              defaultValue={lesson?.video_url && /^https?:\/\//i.test(lesson.video_url) ? lesson.video_url : ""}
              placeholder={t.admin.lessonForm.externalVideoPlaceholder}
            />
            <p className="text-xs text-neutral-500">{t.admin.lessonForm.externalVideoHint}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-content">{t.admin.lessonForm.contentText}</Label>
            <Textarea
              id="lesson-content"
              name="content"
              defaultValue={lesson?.content ?? ""}
              rows={5}
              placeholder={t.admin.lessonForm.contentPlaceholder}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-duration">{t.admin.lessonForm.durationMinutes}</Label>
            <Input
              id="lesson-duration"
              name="duration_minutes"
              type="number"
              min={0}
              defaultValue={lesson?.duration_minutes ?? 0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-thumb">{t.admin.lessonForm.thumbnailUrl}</Label>
            <Input id="lesson-thumb" name="thumbnail_url" defaultValue={lesson?.thumbnail_url ?? ""} />
          </div>

          <label className="flex items-center gap-2.5 rounded-md border border-divider bg-surface px-3.5 py-3 text-sm text-text cursor-pointer">
            <input type="checkbox" name="published" value="true" defaultChecked={lesson?.published ?? true} className="accent-accent" />
            {t.admin.lessonForm.published}
          </label>

          <Button type="submit" disabled={pending} className="mt-1">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {lesson ? t.admin.lessonForm.saveChanges : t.admin.lessonForm.create}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

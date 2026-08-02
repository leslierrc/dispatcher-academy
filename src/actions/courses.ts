"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-helpers";
import { getT } from "@/lib/locale";
import type { AppT } from "@/i18n/app";

export type ActionState = { error?: string; success?: string };

function profileSchema(t: AppT) {
  return z.object({
    name: z.string().min(2, t.actions.courses.invalidName).optional(),
    phone: z.string().optional(),
  });
}

export async function toggleLessonComplete(lessonId: string, completed: boolean): Promise<ActionState> {
  const [user, { t }] = await Promise.all([requireUser(), getT()]);
  const supabase = await createClient();

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/lessons", "layout");
  return { success: completed ? t.actions.courses.lessonCompleted : t.actions.courses.lessonMarkedPending };
}

export async function saveLessonPosition(lessonId: string, seconds: number) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      last_position_seconds: Math.round(seconds),
    },
    { onConflict: "user_id,lesson_id" },
  );
}

export async function updateProfile(prev: ActionState, formData: FormData): Promise<ActionState> {
  const [user, { t }] = await Promise.all([requireUser(), getT()]);
  const parsed = profileSchema(t).safeParse({
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: user.email,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Sincroniza el nombre con auth
  if (parsed.data.name) {
    await supabase.auth.updateUser({ data: { name: parsed.data.name } });
  }

  revalidatePath("/profile");
  return { success: t.actions.courses.profileUpdated };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-helpers";
import { TIER_DEFAULTS } from "@/lib/constants";
import { getT } from "@/lib/locale";
import type { Tier } from "@/lib/types";
import type { AppT } from "@/i18n/app";

export type ActionState = { error?: string; success?: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function uniqueSlug(base: string) {
  const slug = slugify(base) || "curso";
  return `${slug}-${Date.now().toString(36).slice(-4)}`;
}

async function admin() {
  await requireAdmin();
  const [supabase, { t }] = await Promise.all([createClient(), getT()]);
  return { supabase, t };
}

function courseSchema(t: AppT) {
  return z.object({
    title: z.string().min(2, t.actions.admin.titleRequired),
    slug: z.string().optional(),
    description: z.string().optional(),
    category_id: z.string().optional(),
    thumbnail_url: z.string().optional(),
    published: z.coerce.boolean().optional(),
    featured: z.coerce.boolean().optional(),
    order_index: z.coerce.number().optional(),
  });
}

// ── CURSOS ─────────────────────────────────────────────────

export async function createCourse(prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const parsed = courseSchema(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug || uniqueSlug(parsed.data.title),
      description: parsed.data.description || null,
      category_id: parsed.data.category_id || null,
      thumbnail_url: parsed.data.thumbnail_url || null,
      published: parsed.data.published ?? false,
      featured: parsed.data.featured ?? false,
      order_index: parsed.data.order_index ?? 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Cada curso arranca con un solo contenedor de contenido (ya no se
  // maneja el concepto de "módulos" desde la UI) y sus 3 niveles de
  // precio, listos para que el admin solo les ponga precio.
  await supabase.from("modules").insert({ course_id: course.id, title: "Contenido", order_index: 0 });

  const tiers: Tier[] = ["basico", "medio", "pro"];
  await supabase.from("plans").insert(
    tiers.map((tier) => ({
      course_id: course.id,
      tier,
      slug: `${course.slug}-${tier}`,
      price: 0,
      interval: "month" as const,
      ...TIER_DEFAULTS[tier],
    })),
  );

  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.courseCreated };
}

export async function updateCourse(courseId: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const parsed = courseSchema(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      category_id: parsed.data.category_id || null,
      thumbnail_url: parsed.data.thumbnail_url || null,
      published: parsed.data.published ?? false,
      featured: parsed.data.featured ?? false,
      order_index: parsed.data.order_index ?? 0,
    })
    .eq("id", courseId);

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.courseUpdated };
}

export async function toggleCourseStatus(courseId: string, published: boolean) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("courses").update({ published }).eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: published ? t.actions.admin.coursePublished : t.actions.admin.courseHidden };
}

export async function deleteCourse(courseId: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.courseDeleted };
}

export async function duplicateCourse(courseId: string) {
  const { supabase, t } = await admin();
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single();
  if (!course) return { error: t.actions.admin.courseNotFound };

  const { data: newCourse, error } = await supabase
    .from("courses")
    .insert({
      title: `${course.title} (copia)`,
      slug: uniqueSlug(course.title),
      description: course.description,
      category_id: course.category_id,
      thumbnail_url: course.thumbnail_url,
      published: false,
      featured: false,
      order_index: (course.order_index ?? 0) + 100,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Duplica módulos y lecciones
  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons:lessons(*)")
    .eq("course_id", courseId);

  for (const m of modules ?? []) {
    const { data: newModule } = await supabase
      .from("modules")
      .insert({ course_id: newCourse.id, title: m.title, description: m.description, order_index: m.order_index })
      .select()
      .single();

    for (const l of m.lessons ?? []) {
      await supabase.from("lessons").insert({
        module_id: newModule.id,
        title: l.title,
        description: l.description,
        content: l.content,
        video_url: l.video_url,
        duration_minutes: l.duration_minutes,
        thumbnail_url: l.thumbnail_url,
        order_index: l.order_index,
        published: l.published,
      });
    }
  }

  // Duplica los 3 niveles de precio del curso original
  const { data: plans } = await supabase.from("plans").select("*").eq("course_id", courseId);
  for (const p of plans ?? []) {
    await supabase.from("plans").insert({
      course_id: newCourse.id,
      tier: p.tier,
      name: p.name,
      slug: `${newCourse.slug}-${p.tier}`,
      description: p.description,
      price: p.price,
      currency: p.currency,
      interval: p.interval,
      features: p.features,
      badge: p.badge,
      active: p.active,
      order_index: p.order_index,
    });
  }

  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.courseDuplicated };
}

// ── MÓDULOS ────────────────────────────────────────────────

export async function createModule(formData: FormData) {
  const { supabase, t } = await admin();
  const title = String(formData.get("title") || "").trim();
  const courseId = String(formData.get("course_id") || "");
  if (!title || !courseId) return { error: t.actions.admin.missingData };

  const { data: next } = await supabase
    .from("modules")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title,
    description: String(formData.get("description") || "") || null,
    order_index: (next?.order_index ?? -1) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.moduleCreated };
}

export async function updateModule(moduleId: string, formData: FormData) {
  const { supabase, t } = await admin();
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: t.actions.admin.missingData };

  const { error } = await supabase
    .from("modules")
    .update({ title, description: String(formData.get("description") || "") || null })
    .eq("id", moduleId);

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.moduleUpdated };
}

export async function deleteModule(moduleId: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.moduleDeleted };
}

// ── LECCIONES ──────────────────────────────────────────────

function lessonSchema(t: AppT) {
  return z.object({
    title: z.string().min(2, t.actions.admin.titleRequired),
    description: z.string().optional(),
    content: z.string().optional(),
    video_url: z.string().optional(),
    duration_minutes: z.coerce.number().min(0).optional(),
    thumbnail_url: z.string().optional(),
    published: z.coerce.boolean().optional(),
  });
}

export async function createLesson(moduleId: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const parsed = lessonSchema(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: next } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    content: parsed.data.content || null,
    video_url: parsed.data.video_url || null,
    duration_minutes: parsed.data.duration_minutes ?? 0,
    thumbnail_url: parsed.data.thumbnail_url || null,
    published: parsed.data.published ?? true,
    order_index: (next?.order_index ?? -1) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.lessonCreated };
}

// Crea una lección "al vuelo" a partir de un archivo soltado/subido
// directo sobre el módulo (sin pasar por el diálogo de lección).
export async function quickCreateLesson(moduleId: string, title: string) {
  const { supabase, t } = await admin();

  const { data: next } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title: title.trim() || "Nueva lección",
      published: true,
      order_index: (next?.order_index ?? -1) + 1,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.lessonCreated, lessonId: data.id as string };
}

export async function updateLesson(lessonId: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const parsed = lessonSchema(t).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // El campo "video_url" del formulario solo sirve para enlaces externos
  // (YouTube/Vimeo). Si viene vacío, no tocamos la columna: podría tener
  // guardada la ruta de un video subido directamente (ver setLessonVideo),
  // y ese se quita únicamente con el botón "Quitar video".
  const update: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    content: parsed.data.content || null,
    duration_minutes: parsed.data.duration_minutes ?? 0,
    thumbnail_url: parsed.data.thumbnail_url || null,
    published: parsed.data.published ?? true,
  };
  if (parsed.data.video_url) update.video_url = parsed.data.video_url;

  const { error } = await supabase.from("lessons").update(update).eq("id", lessonId);

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/lessons", "layout");
  return { success: t.actions.admin.lessonUpdated };
}

export async function deleteLesson(lessonId: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.lessonDeleted };
}

// ── ARCHIVOS DE LECCIÓN ────────────────────────────────────

export async function addLessonFile(formData: FormData) {
  const { supabase, t } = await admin();
  const lessonId = String(formData.get("lesson_id") || "");
  const name = String(formData.get("name") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const type = String(formData.get("type") || "file");
  if (!lessonId || !name || !url) return { error: t.actions.admin.missingData };

  const { error } = await supabase.from("lesson_files").insert({ lesson_id: lessonId, name, url, type });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/lessons", "layout");
  return { success: t.actions.admin.fileAdded };
}

export async function deleteLessonFile(fileId: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("lesson_files").delete().eq("id", fileId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/lessons", "layout");
  return { success: t.actions.admin.fileDeleted };
}

// ── USUARIOS ───────────────────────────────────────────────

export async function createUserByAdmin(prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const { t } = await getT();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = formData.get("role") === "admin" ? "admin" : "student";

  if (!name) return { error: t.actions.admin.missingName };
  if (!z.string().email().safeParse(email).success) return { error: t.actions.admin.invalidEmail };
  if (password.length < 6) return { error: t.actions.admin.passwordMinChars };

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) return { error: error.message };

  if (role === "admin") {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", data.user.id);
    if (roleError) return { error: roleError.message };
  }

  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.userCreated(email) };
}

export async function updateUserRole(userId: string, role: "admin" | "student") {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.roleUpdated };
}

export async function updateUserStatus(userId: string, status: "active" | "suspended") {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: status === "active" ? t.actions.admin.userActivated : t.actions.admin.userSuspended };
}

export async function resetUserPassword(userId: string, password: string) {
  await requireAdmin();
  const { t } = await getT();
  if (password.length < 6) return { error: t.actions.admin.passwordMin6 };
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.passwordReset };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  const { t } = await getT();
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.userDeleted };
}

export async function enrollUser(userId: string, courseId: string, tier: Tier) {
  const { supabase, t } = await admin();
  const { error } = await supabase
    .from("enrollments")
    .upsert({ user_id: userId, course_id: courseId, tier }, { onConflict: "user_id,course_id" });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.studentEnrolled };
}

// ── PLANES ─────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  interval: z.enum(["one_time", "month", "year"]),
  stripe_price_id: z.string().optional(),
  features: z.string().optional(),
  badge: z.string().optional(),
  active: z.coerce.boolean().optional(),
  order_index: z.coerce.number().optional(),
});

// Edita uno de los 3 niveles de precio de un curso (ya existen desde
// que se crea el curso: acá solo se actualizan, no se crean sueltos).
export async function savePlan(planId: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("plans")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      interval: parsed.data.interval,
      stripe_price_id: parsed.data.stripe_price_id || null,
      features: parsed.data.features ? parsed.data.features.split("\n").map((f) => f.trim()).filter(Boolean) : [],
      badge: parsed.data.badge || null,
      active: parsed.data.active ?? true,
    })
    .eq("id", planId);

  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.planSaved };
}

// ── CATEGORÍAS ─────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const { supabase, t } = await admin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: t.actions.admin.missingName };

  const { error } = await supabase.from("categories").insert({ name, slug: uniqueSlug(name) });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.categoryCreated };
}

// ── CONFIGURACIÓN ──────────────────────────────────────────

export async function updateSiteSettings(prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, t } = await admin();
  const value = {
    brandName: String(formData.get("brandName") || "").trim() || "7 Digital LLC",
    supportEmail: String(formData.get("supportEmail") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim(),
    facebook: String(formData.get("facebook") || "") || null,
    youtube: String(formData.get("youtube") || "") || null,
    tiktok: String(formData.get("tiktok") || "") || null,
    contactEmail: String(formData.get("contactEmail") || "").trim(),
    contactPhone: String(formData.get("contactPhone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
  };

  const { error } = await supabase.from("settings").upsert({ key: "site", value, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { success: t.actions.admin.settingsSaved };
}

// ── STORAGE ────────────────────────────────────────────────
// El bucket "course-files" es privado: solo guardamos la ruta interna.
// Los alumnos nunca reciben esta ruta directamente, solo URLs firmadas
// de corta duración generadas en el momento de ver el contenido
// (ver src/lib/protected-content.ts).

// Genera un "ticket" de subida (token de un solo uso) para que el
// NAVEGADOR suba el archivo directo a Supabase Storage, sin pasar por
// nuestro servidor de Next.js. Los Server Actions tienen un límite de
// tamaño de body: rutear un video de 500MB por ahí es lento y falla.
export async function createUploadTicket(path: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("course-files")
    .createSignedUploadUrl(path, { upsert: true });

  if (error) return { error: error.message };
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

export async function setLessonVideo(lessonId: string, path: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("lessons").update({ video_url: path }).eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/lessons", "layout");
  return { success: t.actions.admin.videoUploaded };
}

export async function removeLessonVideo(lessonId: string) {
  const { supabase, t } = await admin();
  const { error } = await supabase.from("lessons").update({ video_url: null }).eq("id", lessonId);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/lessons", "layout");
  return { success: t.actions.admin.videoDeleted };
}

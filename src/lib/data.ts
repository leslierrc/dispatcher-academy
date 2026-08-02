import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, ModuleWithLessons, Plan, Profile, SettingsValue, Subscription } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

async function getClient() {
  return createClient();
}

// PostgREST no permite ordenar por una columna de un embed uno-a-muchos
// (ej. "lessons(order_index)" sobre modules, que tiene muchas lessons):
// da error PGRST118 y la consulta entera fallaba en silencio, mostrando
// "sin módulos" aunque sí existieran. Se ordenan las lecciones acá.
function sortModuleLessons(modules: ModuleWithLessons[] | null): ModuleWithLessons[] {
  return (modules ?? []).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.order_index - b.order_index),
  }));
}

// ── Cursos del alumno (inscritos) ──────────────────────────
export async function getEnrolledCourses(userId: string): Promise<Course[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at, course:course_id(*)")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error || !data) return [];
  return data
    .map((e) => e.course as unknown as Course)
    .filter((c) => c?.published)
    .filter(Boolean);
}

// ── Cursos publicados (catálogo) ───────────────────────────
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:category_id(*)")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error || !data) return [];
  return data as Course[];
}

// ── Cursos publicados con sus 3 planes (para /pricing) ─────
export async function getPublishedCoursesWithPlans(): Promise<Course[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:category_id(*), plans:plans(*)")
    .eq("published", true)
    .order("order_index", { ascending: true });

  if (error || !data) return [];
  return (data as Course[]).map((c) => ({
    ...c,
    plans: (c.plans ?? [])
      .filter((p) => p.active)
      .sort((a, b) => a.order_index - b.order_index),
  }));
}

// ── Planes de un curso (para el admin y el checkout) ───────
export async function getCoursePlans(courseId: string): Promise<Plan[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error || !data) return [];
  return data as Plan[];
}

// ── Nivel comprado por un alumno en un curso ────────────────
export async function getEnrollmentTier(userId: string, courseId: string): Promise<string | null> {
  const supabase = await getClient();
  const { data } = await supabase
    .from("enrollments")
    .select("tier")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return data?.tier ?? null;
}

// ── Curso con módulos y lecciones ──────────────────────────
export async function getCourseWithModules(slug: string): Promise<Course | null> {
  const supabase = await getClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*, category:category_id(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (!course) return null;

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons:lessons(*)")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  return { ...(course as Course), modules: sortModuleLessons(modules as ModuleWithLessons[] | null) };
}

// ── Lección individual con archivos ────────────────────────
export async function getLessonWithModule(lessonId: string) {
  const supabase = await getClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, module:module_id(*), files:lesson_files(*)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) return null;
  return lesson as Lesson & { module: { id: string; course_id: string; title: string } };
}

// ── Módulos y lecciones de un curso ────────────────────────
export async function getCourseModules(courseId: string): Promise<ModuleWithLessons[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*, lessons:lessons(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error || !data) return [];
  return sortModuleLessons(data as ModuleWithLessons[]);
}

// ── Progreso del alumno por curso ──────────────────────────
export async function getCourseProgress(userId: string) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("progress")
    .select("lesson_id, completed, completed_at")
    .eq("user_id", userId)
    .eq("completed", true);

  if (error || !data) return {};
  return Object.fromEntries(data.map((p) => [p.lesson_id, p.completed]));
}

// ── Stats del dashboard del alumno ─────────────────────────
export async function getStudentStats(userId: string) {
  const [courses, progress] = await Promise.all([
    getEnrolledCourses(userId),
    getCourseProgress(userId),
  ]);

  let totalLessons = 0;
  let completed = 0;
  for (const course of courses) {
    const modules = await getCourseModules(course.id);
    for (const m of modules) {
      for (const l of m.lessons) {
        totalLessons++;
        if (progress[l.id]) completed++;
      }
    }
  }

  return {
    coursesCount: courses.length,
    lessonsCompleted: completed,
    totalLessons,
    percent: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
    courses,
    progress,
  };
}

// ── Admin: todos los cursos ────────────────────────────────
export async function getAdminCourses(): Promise<Course[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:category_id(*)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Course[];
}

// ── Admin: módulos y lecciones de un curso ─────────────────
export async function getAdminCourseDetail(courseId: string) {
  const supabase = await getClient();
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single();
  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons:lessons(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (!course) return null;
  return { ...(course as Course), modules: sortModuleLessons(modules as ModuleWithLessons[] | null) };
}

// ── Admin: usuarios ────────────────────────────────────────
export async function getAdminUsers() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Profile[];
}

// ── Admin: suscripciones ───────────────────────────────────
export async function getAdminSubscriptions() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:plan_id(*), profile:user_id(name, email)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Subscription & { profile?: { name: string | null; email: string | null } })[];
}

// ── Admin: categorías ──────────────────────────────────────
export async function getCategories() {
  const supabase = await getClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");

  if (error || !data) return [];
  return data;
}

// ── Configuración del sitio ────────────────────────────────
export async function getSiteSettings(): Promise<SettingsValue> {
  const supabase = await getClient();
  const { data, error } = await supabase.from("settings").select("value").eq("key", "site").maybeSingle();

  if (error || !data?.value) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(data.value as Partial<SettingsValue>) };
}

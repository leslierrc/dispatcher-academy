import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminCourseDetail, getCoursePlans } from "@/lib/data";
import CourseEditor from "@/components/admin/course-editor";
import CoursePricing from "@/components/admin/course-pricing";
import { getT } from "@/lib/locale";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [detail, plans, { t }] = await Promise.all([getAdminCourseDetail(id), getCoursePlans(id), getT()]);
  if (!detail) notFound();

  const modules = detail.modules ?? [];
  // Ya no se administra por "módulos" desde la UI: todo el contenido
  // de un curso se ve y se sube en un solo lugar. Si por algo el curso
  // no tiene ningún módulo todavía (no debería pasar, se crea solo al
  // crear el curso), se usa null y el editor ofrece prepararlo.
  const moduleId = modules[0]?.id ?? null;
  const lessons = modules.flatMap((m) => m.lessons ?? []).sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin/courses" className="inline-flex w-fit items-center gap-2 text-sm text-neutral-400 hover:text-accent-300 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t.admin.courses.backToCourses}
      </Link>
      <CoursePricing course={detail} plans={plans} />
      <CourseEditor course={detail} moduleId={moduleId} lessons={lessons} />
    </div>
  );
}

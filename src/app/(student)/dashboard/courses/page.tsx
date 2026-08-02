import { requireUser } from "@/lib/auth-helpers";
import { getEnrolledCourses, getPublishedCoursesWithPlans } from "@/lib/data";
import { getT } from "@/lib/locale";
import CourseCard from "@/components/dashboard/course-card";
import CourseCatalogCard from "@/components/dashboard/course-catalog-card";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default async function MyCoursesPage() {
  const user = await requireUser();
  const [enrolled, catalog, { t }] = await Promise.all([
    getEnrolledCourses(user.id),
    getPublishedCoursesWithPlans(),
    getT(),
  ]);

  const enrolledIds = new Set(enrolled.map((c) => c.id));
  const available = catalog.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.courses.title}</h1>
        <p className="mt-1 text-neutral-400">{t.courses.subtitle}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-accent-300">{t.courses.inProgress}</h2>
        {enrolled.length === 0 ? (
          <Card>
            <CardContent className="pt-10 pb-10 text-center text-neutral-400 text-sm">
              {t.courses.noCoursesAssigned}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrolled.map((course) => (
              <CourseCard key={course.id} course={course} userId={user.id} t={t} />
            ))}
          </div>
        )}
      </section>

      {available.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-300" />
            <h2 className="font-heading text-xl text-text">{t.courses.availableCatalog}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((course) => (
              <CourseCatalogCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

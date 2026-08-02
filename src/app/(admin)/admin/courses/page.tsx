import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminCourses } from "@/lib/data";
import CoursesManager from "@/components/admin/courses-manager";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getAdminCourses();

  return <CoursesManager courses={courses} />;
}

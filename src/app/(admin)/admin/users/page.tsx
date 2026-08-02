import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminUsers, getAdminCourses } from "@/lib/data";
import UsersManager from "@/components/admin/users-manager";

export default async function AdminUsersPage() {
  await requireAdmin();
  const [users, courses] = await Promise.all([getAdminUsers(), getAdminCourses()]);

  return <UsersManager users={users} courses={courses} />;
}

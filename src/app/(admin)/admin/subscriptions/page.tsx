import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminEnrollments, getAdminSubscriptions } from "@/lib/data";
import SubscriptionsManager from "@/components/admin/subscriptions-manager";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const [enrollments, subscriptions] = await Promise.all([
    getAdminEnrollments(),
    getAdminSubscriptions(),
  ]);

  return <SubscriptionsManager enrollments={enrollments} subscriptions={subscriptions} />;
}

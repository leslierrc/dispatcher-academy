import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminSubscriptions } from "@/lib/data";
import SubscriptionsManager from "@/components/admin/subscriptions-manager";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const subscriptions = await getAdminSubscriptions();

  return <SubscriptionsManager subscriptions={subscriptions} />;
}

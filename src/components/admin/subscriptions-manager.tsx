import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS, TIER_LABELS } from "@/lib/constants";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { Enrollment, Subscription, Tier } from "@/lib/types";

type EnrollmentRow = Enrollment & {
  profile?: { name: string | null; email: string | null };
  course?: { title: string; slug: string };
};
type SubscriptionRow = Subscription & { profile?: { name: string | null; email: string | null } };

export default function SubscriptionsManager({
  enrollments,
  subscriptions,
}: {
  enrollments: EnrollmentRow[];
  subscriptions: SubscriptionRow[];
}) {
  const { t } = useAppI18n();
  const paidUserIds = new Set(subscriptions.map((s) => s.user_id));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.admin.subscriptions.title}</h1>
        <p className="mt-1 text-neutral-400">{t.admin.subscriptions.subtitle}</p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-lg border border-divider">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-divider bg-surface/60">
              <tr>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colStudent}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colCourse}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colLevel}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colSource}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colEnrolled}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-divider/50 last:border-b-0 hover:bg-surface/30">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-text">{e.profile?.name || e.profile?.email || "—"}</div>
                    <div className="text-xs text-neutral-500">{e.profile?.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-text">{e.course?.title ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full border border-divider px-2.5 py-0.5 text-[11px] font-heading font-semibold text-text">
                      {TIER_LABELS[e.tier as Tier] ?? e.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-400">
                    {paidUserIds.has(e.user_id) ? t.admin.subscriptions.paidStripe : t.admin.subscriptions.assignedManually}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {new Date(e.enrolled_at).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                    {t.admin.subscriptions.noEnrollments}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-text">{t.admin.subscriptions.stripePayments}</h2>
        <div className="overflow-x-auto rounded-lg border border-divider">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-divider bg-surface/60">
              <tr>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colStudent}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colPlan}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colStatus}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colStart}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colExpires}</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-divider/50 last:border-b-0 hover:bg-surface/30">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-text">{s.profile?.name || s.profile?.email || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-text">{s.plan?.name ?? "—"}</div>
                    <div className="text-xs text-neutral-500">${Number(s.plan?.price ?? 0)}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-heading font-semibold ${SUBSCRIPTION_STATUS_COLORS[s.status] ?? ""}`}>
                      {SUBSCRIPTION_STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {new Date(s.created_at).toLocaleDateString("es")}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("es") : "—"}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                    {t.admin.subscriptions.noPayments}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react";
import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS, TIER_LABELS } from "@/lib/constants";
import { useAppI18n } from "@/hooks/use-app-i18n";
import { Card, CardContent } from "@/components/ui/card";
import type { Enrollment, Subscription, Tier } from "@/lib/types";

type EnrollmentRow = Enrollment & {
  profile?: { name: string | null; email: string | null };
  course?: { title: string; slug: string };
};
type SubscriptionRow = Subscription & { profile?: { name: string | null; email: string | null } };

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function SubscriptionsManager({
  enrollments,
  subscriptions,
}: {
  enrollments: EnrollmentRow[];
  subscriptions: SubscriptionRow[];
}) {
  const { t } = useAppI18n();
  const paidUserIds = new Set(subscriptions.map((s) => s.user_id));

  // Los planes son mensuales: cada fila de "subscriptions" es una
  // suscripción recurrente de Stripe, no un pago único. "Cuánto genero"
  // se traduce en MRR (ingresos mensuales recurrentes) — la suma de lo
  // que cobran las suscripciones activas ahora mismo, no un acumulado
  // histórico (que necesitaría el historial de facturas de Stripe,
  // no solo el estado actual).
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((acc, s) => acc + Number(s.plan?.price ?? 0), 0);
  const avgTicket = activeSubs.length ? mrr / activeSubs.length : 0;
  const now = new Date();
  const newThisMonth = subscriptions.filter((s) => {
    const d = new Date(s.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Para mostrar cuánto paga cada alumno inscrito por mes: matchea la
  // inscripción (usuario + curso + nivel) contra su suscripción de
  // Stripe activa. Las inscripciones asignadas a mano no tienen pago.
  const amountByEnrollment = new Map<string, number>();
  for (const s of activeSubs) {
    if (!s.plan?.course_id || !s.plan.tier) continue;
    amountByEnrollment.set(`${s.user_id}:${s.plan.course_id}:${s.plan.tier}`, Number(s.plan.price));
  }

  const metrics = [
    { label: t.admin.subscriptions.mrr, value: formatMoney(mrr), icon: DollarSign },
    { label: t.admin.subscriptions.payingStudents, value: activeSubs.length, icon: Users },
    { label: t.admin.subscriptions.avgTicket, value: formatMoney(avgTicket), icon: Wallet },
    { label: t.admin.subscriptions.newThisMonth, value: newThisMonth, icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.admin.subscriptions.title}</h1>
        <p className="mt-1 text-neutral-400">{t.admin.subscriptions.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/15 text-accent-300">
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-2xl text-text tabular-nums">{m.value}</div>
                <div className="text-xs text-neutral-400">{m.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-lg border border-divider">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-divider bg-surface/60">
              <tr>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colStudent}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colCourse}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colLevel}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colAmount}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colSource}</th>
                <th className="px-5 py-3.5 font-heading font-semibold text-text">{t.admin.subscriptions.colEnrolled}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const amount = amountByEnrollment.get(`${e.user_id}:${e.course_id}:${e.tier}`);
                return (
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
                    <td className="px-5 py-3.5 text-text tabular-nums">
                      {amount !== undefined ? formatMoney(amount) : t.admin.subscriptions.notPaid}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400">
                      {paidUserIds.has(e.user_id) ? t.admin.subscriptions.paidStripe : t.admin.subscriptions.assignedManually}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {new Date(e.enrolled_at).toLocaleDateString("es")}
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
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
                    <div className="text-xs text-neutral-500">{formatMoney(Number(s.plan?.price ?? 0))}</div>
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

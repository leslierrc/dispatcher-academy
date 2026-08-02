import { SUBSCRIPTION_STATUS_COLORS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants";
import type { Subscription } from "@/lib/types";

export default function SubscriptionsManager({
  subscriptions,
}: {
  subscriptions: (Subscription & { profile?: { name: string | null; email: string | null } })[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-text">Suscripciones</h1>
        <p className="mt-1 text-neutral-400">
          Los precios de cada curso se editan desde el propio curso, en Admin → Cursos.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-divider">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-divider bg-surface/60">
            <tr>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Alumno</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Plan</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Estado</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Inicio</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Vence</th>
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
                  Todavía no hay suscripciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

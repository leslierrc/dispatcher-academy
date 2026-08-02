"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { savePlan, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIER_LABELS } from "@/lib/constants";
import type { Course, Plan } from "@/lib/types";

const initialState: ActionState = {};

export default function CoursePricing({ course, plans }: { course: Course; plans: Plan[] }) {
  const [editing, setEditing] = useState<Plan | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-xl text-text">Precios de «{course.title}»</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Básico lee documentos y escucha audio. Medio suma los videos. Pro suma mentoría 1:1 y descarga de
          documentos y audios (el video nunca se puede descargar).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3 rounded-lg border border-divider bg-surface/40 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg text-text">{plan.tier ? TIER_LABELS[plan.tier] : plan.name}</h3>
                {plan.badge && <Badge className="mt-1.5">{plan.badge}</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(plan)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="font-heading text-3xl text-text">
              ${Number(plan.price).toLocaleString("en-US")}
              <span className="ml-1 text-sm font-body text-neutral-400">pago único</span>
            </div>
            <div className="text-sm text-neutral-400">{plan.description}</div>
            <ul className="mt-1 flex flex-col gap-1.5">
              {(plan.features ?? []).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-accent-300">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2">
              <Badge variant={plan.active ? "success" : "neutral"}>
                {plan.active ? "Visible en /pricing" : "Oculto"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nivel {editing?.tier ? TIER_LABELS[editing.tier] : ""}</DialogTitle>
            <DialogDescription>Precio y beneficios que ve el alumno en /pricing.</DialogDescription>
          </DialogHeader>
          {editing && <PlanForm plan={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const [state, action, pending] = useActionState(
    (prev: ActionState, fd: FormData) => savePlan(plan.id, prev, fd),
    initialState,
  );

  useEffect(() => {
    // Reacciona al resultado de la Server Action (sistema externo):
    // no hay forma de cerrar el diálogo de forma síncrona en el render.
    if (state.success) {
      onDone();
    }
  }, [state.success, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          {state.error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-name">Nombre visible</Label>
          <Input id="p-name" name="name" defaultValue={plan.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="p-price">Precio (USD)</Label>
          <Input id="p-price" name="price" type="number" min={0} step="0.01" defaultValue={plan.price} required />
        </div>
      </div>
      <input type="hidden" name="interval" value={plan.interval} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-badge">Badge (opcional)</Label>
        <Input id="p-badge" name="badge" defaultValue={plan.badge ?? ""} placeholder="Recomendado" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-desc">Descripción</Label>
        <Input id="p-desc" name="description" defaultValue={plan.description ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-features">Beneficios (uno por línea)</Label>
        <Textarea id="p-features" name="features" defaultValue={(plan.features ?? []).join("\n")} rows={4} />
      </div>
      <label className="flex items-center gap-2.5 rounded-md border border-divider bg-surface px-3.5 py-3 text-sm text-text cursor-pointer">
        <input type="checkbox" name="active" value="true" defaultChecked={plan.active} className="accent-accent" />
        Visible en /pricing
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}

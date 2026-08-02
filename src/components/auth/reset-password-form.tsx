"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "", success: "" };

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          {state.error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <Input id="confirm" name="confirm" type="password" placeholder="Repite tu contraseña" required autoComplete="new-password" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Guardando…" : "Actualizar contraseña"}
      </Button>
    </form>
  );
}

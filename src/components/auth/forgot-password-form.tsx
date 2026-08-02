"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "", success: "" };

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300">
          {state.success}
        </div>
      )}
      <p className="text-sm text-neutral-400 -mt-1">
        Te enviaremos un enlace a tu correo para restablecer tu contraseña.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@correo.com" required autoComplete="email" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>
      <p className="text-center text-sm text-neutral-400 mt-2">
        <Link href="/login" className="text-accent-300 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}

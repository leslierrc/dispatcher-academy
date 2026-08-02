"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "", success: "" };

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, initialState);

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" name="name" type="text" placeholder="Tu nombre" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@correo.com" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required autoComplete="new-password" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-neutral-400 mt-2">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent-300 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

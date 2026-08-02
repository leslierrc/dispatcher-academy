"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppI18n } from "@/hooks/use-app-i18n";

const initialState = { error: "", success: "" };

export default function RegisterForm({ next }: { next?: string }) {
  const { t } = useAppI18n();
  const [state, action, pending] = useActionState(register, initialState);
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
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
        <Label htmlFor="name">{t.auth.fullName}</Label>
        <Input id="name" name="name" type="text" placeholder="Tu nombre" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input id="email" name="email" type="email" placeholder="tu@correo.com" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required autoComplete="new-password" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t.auth.creatingAccount : t.auth.createAccount}
      </Button>
      <p className="text-center text-sm text-neutral-400 mt-2">
        {t.auth.haveAccount}{" "}
        <Link href={loginHref} className="text-accent-300 hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}

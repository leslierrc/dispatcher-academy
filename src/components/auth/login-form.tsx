"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppI18n } from "@/hooks/use-app-i18n";

const initialState = { error: "", success: "" };

export default function LoginForm({ next }: { next?: string }) {
  const { t } = useAppI18n();
  const [state, action, pending] = useActionState(login, initialState);
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          {state.error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input id="email" name="email" type="email" placeholder="tu@correo.com" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Link href="/forgot-password" className="text-xs text-accent-300 hover:underline">
            {t.auth.forgotPassword}
          </Link>
        </div>
        <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t.auth.loggingIn : t.auth.login}
      </Button>
      <p className="text-center text-sm text-neutral-400 mt-2">
        {t.auth.noAccount}{" "}
        <Link href={registerHref} className="text-accent-300 hover:underline">
          {t.auth.registerFree}
        </Link>
      </p>
    </form>
  );
}

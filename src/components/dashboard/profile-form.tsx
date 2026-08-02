"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { updateProfile, type ActionState } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppI18n } from "@/hooks/use-app-i18n";

const initialState: ActionState = {};

export default function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string | null;
  email: string | null;
  phone: string | null;
}) {
  const { t } = useAppI18n();
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {state.success}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.profile.fullName}</Label>
        <Input id="name" name="name" defaultValue={name ?? ""} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.profile.email}</Label>
        <Input id="email" value={email ?? ""} disabled />
        <span className="text-xs text-neutral-500">{t.profile.emailLocked}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t.profile.phone}</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} placeholder="+1..." />
      </div>
      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? t.profile.saving : t.profile.save}
      </Button>
    </form>
  );
}

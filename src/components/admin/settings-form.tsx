"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateSiteSettings, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppI18n } from "@/hooks/use-app-i18n";
import type { SettingsValue } from "@/lib/types";

const initialState: ActionState = {};

export default function SettingsForm({ settings }: { settings: SettingsValue }) {
  const { t } = useAppI18n();
  const [state, action, pending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={action} className="flex flex-col gap-8 max-w-3xl">
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {state.success}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-text">{t.admin.settings.brand}</h2>
        <div className="flex flex-col gap-1.5 sm:max-w-md">
          <Label htmlFor="brandName">{t.admin.settings.brandName}</Label>
          <Input id="brandName" name="brandName" defaultValue={settings.brandName} />
          <p className="text-xs text-neutral-500">{t.admin.settings.brandNameHint}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-text">{t.admin.settings.contact}</h2>
        <p className="text-xs text-neutral-500 -mt-2">{t.admin.settings.contactHint}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supportEmail">{t.admin.settings.supportEmail}</Label>
            <Input id="supportEmail" name="supportEmail" type="email" defaultValue={settings.supportEmail} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">{t.admin.settings.contactEmail}</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp">{t.admin.settings.whatsapp}</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} placeholder="+1..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">{t.admin.settings.phone}</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl text-text">{t.admin.settings.socialNetworks}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" defaultValue={settings.instagram} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" defaultValue={settings.facebook ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" name="youtube" defaultValue={settings.youtube ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok">TikTok</Label>
            <Input id="tiktok" name="tiktok" defaultValue={settings.tiktok ?? ""} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">{t.admin.settings.address}</Label>
          <Input id="address" name="address" defaultValue={settings.address} />
        </div>
      </section>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? t.admin.settings.saving : t.admin.settings.save}
      </Button>
    </form>
  );
}

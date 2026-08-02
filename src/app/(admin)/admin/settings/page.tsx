import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-helpers";
import { getSiteSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/settings-form";
import { getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, { t }] = await Promise.all([getSiteSettings(), getT()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.admin.settings.title}</h1>
        <p className="mt-1 text-neutral-400">{t.admin.settings.subtitle}</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}

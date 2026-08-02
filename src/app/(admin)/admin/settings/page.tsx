import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-helpers";
import { getSiteSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-text">Configuración</h1>
        <p className="mt-1 text-neutral-400">Nombre, colores, redes y datos de contacto de la plataforma.</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}

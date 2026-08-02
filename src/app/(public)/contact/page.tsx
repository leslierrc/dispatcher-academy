import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import CTASection from "@/components/sections/CTASection";
import { getSiteSettings } from "@/lib/data";
import { CARLA_INSTAGRAM_URL } from "@/i18n/translations";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes dudas sobre el curso? Escríbenos y te ayudamos a decidir si el dispatch es para ti.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const email = settings.supportEmail || settings.contactEmail;
  const whatsappDigits = settings.whatsapp.replace(/[^\d]/g, "");

  return (
    <main className="pt-40 pb-24 px-6 lg:px-14">
      <div className="max-w-[900px] mx-auto">
        <h1 className="font-heading text-[clamp(38px,5vw,64px)] leading-none">Hablemos</h1>
        <p className="mt-4 text-neutral-300 max-w-xl">
          Resolvemos todas tus dudas antes de que tomes la decisión. Escríbenos por el canal que prefieras.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 rounded-lg border border-divider bg-surface/40 p-6 hover:border-accent/40 transition-colors"
            >
              <Mail className="w-6 h-6 text-accent-300" />
              <div>
                <div className="font-heading text-lg">Correo</div>
                <div className="text-sm text-neutral-400">{email}</div>
              </div>
            </a>
          )}
          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border border-divider bg-surface/40 p-6 hover:border-accent/40 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-accent-300" />
              <div>
                <div className="font-heading text-lg">WhatsApp</div>
                <div className="text-sm text-neutral-400">Respuesta en menos de 24h</div>
              </div>
            </a>
          )}
          <a
            href={CARLA_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-divider bg-surface/40 p-6 hover:border-accent/40 transition-colors"
          >
            <FaInstagram className="w-6 h-6 text-accent-300" />
            <div>
              <div className="font-heading text-lg">Instagram</div>
              <div className="text-sm text-neutral-400">@soy_carlitta</div>
            </div>
          </a>
          <div className="flex items-center gap-4 rounded-lg border border-divider bg-surface/40 p-6">
            <div className="font-heading text-4xl text-accent-300">24h</div>
            <div>
              <div className="font-heading text-lg">Tiempo de respuesta</div>
              <div className="text-sm text-neutral-400">Nos comprometemos a responder rápido</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <CTASection />
      </div>
    </main>
  );
}

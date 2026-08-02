import type { Metadata } from "next";
import PricingSection from "@/components/sections/PricingSection";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Elige el plan ideal para empezar como dispatcher de fletes. Pago único, acceso de por vida y mentoría real.",
};

export default function PricingPage() {
  return (
    <main>
      <div className="pt-40 pb-10 px-6 lg:px-14 text-center">
        <h1 className="font-heading text-[clamp(38px,5vw,64px)] leading-none">Inversión en tu futuro</h1>
        <p className="mt-4 text-neutral-300 max-w-xl mx-auto">
          Tres planes pensados para que empieces sin experiencia y consigas tu primer cliente.
        </p>
      </div>
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}

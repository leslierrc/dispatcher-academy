"use client";

import dynamic from "next/dynamic";
import { I18nProvider } from "@/hooks/use-i18n";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import ScrollProgress from "@/components/effects/ScrollProgress";
import PWARegister from "@/components/effects/PWARegister";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";

const RoleSection = dynamic(() => import("@/components/sections/RoleSection"), { ssr: false });
const MarqueeSection = dynamic(() => import("@/components/sections/TrustLogos"), { ssr: false });
const StatsSection = dynamic(() => import("@/components/sections/VideoSection"), { ssr: false });
const AboutSection = dynamic(() => import("@/components/sections/LearnSection"), { ssr: false });
const WhySection = dynamic(() => import("@/components/sections/AISection"), { ssr: false });
const CurriculumSection = dynamic(() => import("@/components/sections/DashboardSection"), { ssr: false });
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"), { ssr: false });
const PricingSection = dynamic(() => import("@/components/sections/PricingSection"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/sections/FAQSection"), { ssr: false });
const CTASection = dynamic(() => import("@/components/sections/CTASection"), { ssr: false });
const Footer = dynamic(() => import("@/components/sections/Footer"), { ssr: false });

const CustomCursor = dynamic(() => import("@/components/effects/CustomCursor"), { ssr: false });

function LandingPage() {
  useSmoothScroll();

  return (
    <>
      <PWARegister />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />

      <main>
        <Hero />
        <RoleSection />
        <MarqueeSection />
        <StatsSection />
        <AboutSection />
        <WhySection />
        <CurriculumSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </>
  );
}

export default function Page() {
  return (
    <I18nProvider>
      <LandingPage />
    </I18nProvider>
  );
}

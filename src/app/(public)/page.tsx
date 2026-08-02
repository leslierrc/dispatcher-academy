"use client";

import dynamic from "next/dynamic";

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
const Hero = dynamic(() => import("@/components/sections/Hero"), { ssr: false });

export default function HomePage() {
  return (
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
  );
}

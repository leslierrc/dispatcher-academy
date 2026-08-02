"use client";

import CanvasMesh from "@/components/effects/CanvasMesh";
import LoadingScreen from "@/components/effects/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { I18nProvider } from "@/hooks/use-i18n";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import type { SettingsValue } from "@/lib/types";
import type { Locale } from "@/i18n/translations";

export default function PublicShell({
  children,
  settings,
  initialLocale,
}: {
  children: React.ReactNode;
  settings: SettingsValue;
  initialLocale: Locale;
}) {
  useSmoothScroll();

  return (
    <I18nProvider initialLocale={initialLocale}>
      <CanvasMesh />
      <div className="noise-overlay" />
      <LoadingScreen />
      <Navbar />
      {children}
      <Footer settings={settings} />
    </I18nProvider>
  );
}

"use client";

import CanvasMesh from "@/components/effects/CanvasMesh";
import LoadingScreen from "@/components/effects/LoadingScreen";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { I18nProvider } from "@/hooks/use-i18n";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import type { SettingsValue } from "@/lib/types";

export default function PublicShell({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: SettingsValue;
}) {
  useSmoothScroll();

  return (
    <I18nProvider>
      <CanvasMesh />
      <div className="noise-overlay" />
      <LoadingScreen />
      <Navbar />
      {children}
      <Footer settings={settings} />
    </I18nProvider>
  );
}

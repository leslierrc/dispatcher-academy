"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { appTranslations } from "@/i18n/app";
import type { Locale } from "@/i18n/translations";
import { LOCALE_COOKIE } from "@/lib/locale-cookie";

type AppTranslationKeys = (typeof appTranslations)["en" | "es"];

interface AppI18nContextType {
  locale: Locale;
  t: AppTranslationKeys;
  setLocale: (next: Locale) => void;
}

const AppI18nContext = createContext<AppI18nContextType | undefined>(undefined);

function persistLocale(next: Locale) {
  // Misma cookie que lee el servidor (src/lib/locale.ts) y que usa el
  // I18nProvider de la landing: el idioma es uno solo en toda la app.
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
}

// Proveedor separado del de la landing (use-i18n.tsx): el panel vive
// mayormente en Server Components y recibe su propio diccionario
// (src/i18n/app.ts) vía prop `initialLocale` leída de la cookie.
export function AppI18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const t = appTranslations[locale];

  return (
    <AppI18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </AppI18nContext.Provider>
  );
}

export function useAppI18n() {
  const context = useContext(AppI18nContext);
  if (!context) {
    throw new Error("useAppI18n must be used within an AppI18nProvider");
  }
  return context;
}

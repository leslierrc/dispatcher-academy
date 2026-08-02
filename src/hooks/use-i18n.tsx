"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { translations, type Locale } from "@/i18n/translations";
import { LOCALE_COOKIE } from "@/lib/locale-cookie";

type TranslationKeys = (typeof translations)["en" | "es"];

interface I18nContextType {
  locale: Locale;
  t: TranslationKeys;
  toggleLocale: () => void;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function persistLocale(next: Locale) {
  // Un año, misma cookie que lee el servidor (src/lib/locale.ts) para
  // que el panel (Server Components) sepa qué idioma mostrar.
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "es");
  const router = useRouter();

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    router.refresh();
  }, [router]);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "en" ? "es" : "en";
      persistLocale(next);
      return next;
    });
    router.refresh();
  }, [router]);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

import { cookies } from "next/headers";
import type { Locale } from "@/i18n/translations";
import { appTranslations } from "@/i18n/app";
import { LOCALE_COOKIE } from "@/lib/locale-cookie";

export { LOCALE_COOKIE };

// Lee el idioma elegido por el usuario desde la cookie (la landing y el
// panel comparten la misma cookie, así la elección persiste entre las
// dos partes de la app). Los Server Components no pueden usar el
// I18nContext de React (es cliente), por eso leen el idioma acá y
// pasan el diccionario de textos como prop hacia abajo.
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}

// Diccionario de textos del panel para el idioma actual, listo para
// usar en un Server Component: const t = await getT();
export async function getT() {
  const locale = await getLocale();
  return { locale, t: appTranslations[locale] };
}

// Separado de src/lib/locale.ts (que importa "next/headers", solo
// válido en servidor) para que los componentes cliente puedan usar el
// nombre de la cookie sin arrastrar ese import al bundle del navegador.
export const LOCALE_COOKIE = "locale";

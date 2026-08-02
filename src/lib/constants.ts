import type { SettingsValue, Tier } from "@/lib/types";

export const APP_NAME = "7 Digital LLC";

// NEXT_PUBLIC_APP_URL a veces se carga con "/" al final (copiado tal
// cual del navegador o de Vercel). Concatenar eso con "/dashboard" da
// "...app//dashboard" — Supabase no lo reconoce como un redirect_to
// válido y termina mandando a la URL de fallback (localhost). Esta
// función centraliza el valor ya limpio para usar en toda la app.
export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

// Orden de nivel (para comparar "¿alcanza este tier para ver X?").
export const TIER_RANK: Record<Tier, number> = { basico: 0, medio: 1, pro: 2 };

export const TIER_LABELS: Record<Tier, string> = {
  basico: "Básico",
  medio: "Medio",
  pro: "Pro",
};

export const TIER_DEFAULTS: Record<Tier, { name: string; description: string; features: string[]; badge: string | null; order_index: number }> = {
  basico: {
    name: "Básico",
    description: "Lee los documentos y escucha el audio del curso.",
    features: ["Documentos del curso", "Audios del curso", "Acceso de por vida"],
    badge: null,
    order_index: 0,
  },
  medio: {
    name: "Medio",
    description: "Todo lo de Básico, más los videos del curso.",
    features: ["Todo lo de Básico", "Videos del curso"],
    badge: "Recomendado",
    order_index: 1,
  },
  pro: {
    name: "Pro",
    description: "Todo lo de Medio, más mentoría 1:1 y descargas.",
    features: ["Todo lo de Medio", "Mentoría 1:1", "Descarga documentos y audios"],
    badge: null,
    order_index: 2,
  },
};

export const DEFAULT_SETTINGS: SettingsValue = {
  brandName: "7 Digital LLC",
  supportEmail: "soporte@7digitalllc.com",
  whatsapp: "",
  instagram: "",
  facebook: null,
  youtube: null,
  tiktok: null,
  contactEmail: "hola@7digitalllc.com",
  contactPhone: "",
  address: "",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  trialing: "Prueba",
  past_due: "Pago vencido",
  canceled: "Cancelada",
  unpaid: "Impaga",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  trialing: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  past_due: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  canceled: "text-neutral-400 border-neutral-500/30 bg-neutral-500/10",
  unpaid: "text-red-400 border-red-500/30 bg-red-500/10",
  incomplete: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  incomplete_expired: "text-neutral-400 border-neutral-500/30 bg-neutral-500/10",
};

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  image: "Imagen",
  audio: "Audio",
  doc: "Documento",
  archive: "Archivo",
};

export const NAV_LINKS = [
  { label: "Programa", href: "#curricula" },
  { label: "Precios", href: "#precios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "FAQ", href: "#faq" },
];

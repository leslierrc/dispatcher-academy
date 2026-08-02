import type { Metadata } from "next";
import PublicShell from "./_components/public-shell";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    default: "7 Digital LLC — Certificación en Despacho de Fletes",
    template: "%s | 7 Digital LLC",
  },
  description:
    "Formamos personas sin experiencia previa para que entren a la industria del transporte con un oficio real, ingresos propios y la libertad de trabajar desde donde quieran.",
  keywords: [
    "dispatcher de fletes",
    "freight dispatcher",
    "curso de dispatch",
    "despacho de camiones",
    "7 Digital LLC",
    "trabajo remoto logística",
    "owner operator",
    "broker de cargas",
  ],
  authors: [{ name: "7 Digital LLC" }],
  creator: "7 Digital LLC",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "7 Digital LLC",
    title: "7 Digital LLC — Certificación en Despacho de Fletes",
    description:
      "La plataforma para aprender el oficio que transforma tu vida. Mentoría 1:1 con Carla.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "7 Digital LLC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "7 Digital LLC — Certificación en Despacho de Fletes",
    description: "La plataforma para aprender el oficio que transforma tu vida.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "7 Digital LLC",
    description:
      "Formamos personas sin experiencia previa para que entren a la industria del transporte con un oficio real, ingresos propios y la libertad de trabajar desde donde quieran.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    sameAs: [],
    address: { "@type": "PostalAddress", addressCountry: "US" },
    offers: [
      { "@type": "Offer", name: "Básico", price: "297", priceCurrency: "USD", priceValidUntil: "2026-12-31" },
      { "@type": "Offer", name: "Pro", price: "597", priceCurrency: "USD", priceValidUntil: "2026-12-31" },
      { "@type": "Offer", name: "VIP", price: "1297", priceCurrency: "USD", priceValidUntil: "2026-12-31" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicShell settings={settings}>{children}</PublicShell>
    </>
  );
}

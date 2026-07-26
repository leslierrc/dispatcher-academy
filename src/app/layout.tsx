import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "600"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "7 Digital LLC — Certificación en Despacho de Fletes",
    template: "%s | 7 Digital LLC",
  },
  description:
    "7 Digital LLC te forma paso a paso para conseguir tu primer contrato en la industria del transporte de EE. UU. — con mentoría 1:1 de Carla.",
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
    url: "https://carlaacademy.com",
    siteName: "7 Digital LLC",
    title: "7 Digital LLC — Certificación en Despacho de Fletes",
    description:
      "Conviértete en Dispatcher de Fletes y trabaja remoto. Mentoría 1:1 con Carla.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "7 Digital LLC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "7 Digital LLC — Certificación en Despacho de Fletes",
    description: "Conviértete en Dispatcher de Fletes y trabaja remoto.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b68235",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "7 Digital LLC",
    description:
      "Certificación en despacho de fletes con mentoría 1:1 de Carla.",
    url: "https://carlaacademy.com",
    logo: "https://carlaacademy.com/logo.png",
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Básico",
        price: "297",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "597",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
      },
      {
        "@type": "Offer",
        name: "Premium",
        price: "1297",
        priceCurrency: "USD",
        priceValidUntil: "2026-12-31",
      },
    ],
  };

  return (
    <html lang="es" className={`${cormorant.variable} ${lora.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="7 Digital LLC" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-bg text-text">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}

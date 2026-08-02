"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: t.nav.curriculum, href: "#curricula" },
    { label: t.nav.pricing, href: "#precios" },
    { label: t.nav.stories, href: "#testimonios" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500 border-b ${
        scrolled
          ? "px-6 py-3 bg-bg/85 backdrop-blur-xl border-divider"
          : "px-6 py-5 bg-transparent border-transparent"
      } lg:px-14`}
    >
      <a href="#top" aria-label="7 Digital LLC" className="flex items-center">
        <Logo height={30} />
      </a>

      <div className="hidden lg:flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[13px] tracking-wide text-text/85 hover:text-accent transition-colors"
          >
            {link.label}
          </a>
        ))}

        <div className="flex border border-divider rounded-md overflow-hidden">
          <button
            onClick={() => setLocale("es")}
            className="border-0 bg-transparent font-heading text-xs px-3 py-1.5 cursor-pointer transition-colors"
            style={{ color: locale === "es" ? "var(--color-accent)" : "inherit" }}
          >
            ES
          </button>
          <button
            onClick={() => setLocale("en")}
            className="border-0 border-l border-divider bg-transparent font-heading text-xs px-3 py-1.5 cursor-pointer transition-colors"
            style={{ color: locale === "en" ? "var(--color-accent)" : "inherit" }}
          >
            EN
          </button>
        </div>

        <a
          href="/login"
          className="font-heading font-semibold text-sm text-text/80 hover:text-accent transition-colors"
        >
          {t.nav.login}
        </a>

        <motion.a
          href="#precios"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center border border-accent text-accent font-heading font-semibold text-sm px-5 py-2 rounded-md hover:bg-accent/10 transition-colors"
        >
          {t.nav.cta}
        </motion.a>
      </div>

      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden p-2 text-text"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-bg border-b border-divider overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-text/85 hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 py-3">
                <button
                  onClick={() => setLocale("es")}
                  className="font-heading text-sm"
                  style={{ color: locale === "es" ? "var(--color-accent)" : "inherit" }}
                >
                  ES
                </button>
                <span className="text-divider">/</span>
                <button
                  onClick={() => setLocale("en")}
                  className="font-heading text-sm"
                  style={{ color: locale === "en" ? "var(--color-accent)" : "inherit" }}
                >
                  EN
                </button>
              </div>
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-text/85 hover:text-accent transition-colors"
              >
                {t.nav.login}
              </a>
              <a
                href="#precios"
                onClick={() => setMobileOpen(false)}
                className="mt-2 text-center border border-accent text-accent font-heading font-semibold text-sm px-5 py-2.5 rounded-md"
              >
                {t.nav.cta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

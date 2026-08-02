"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useAppI18n } from "@/hooks/use-app-i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/translations";

const LOCALE_LABEL: Record<Locale, string> = { es: "Español", en: "English" };
const LOCALE_CODE: Record<Locale, string> = { es: "ES", en: "EN" };

export default function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useAppI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t.shell.language}
        className="flex items-center gap-1.5 rounded-md border border-divider bg-surface/60 pl-2.5 pr-2 py-1.5 text-sm text-neutral-300 hover:border-accent/40 hover:text-text transition-colors cursor-pointer"
      >
        <Globe className="h-4 w-4 text-accent-300" />
        <span className="font-heading text-[11px] tracking-wide">{LOCALE_CODE[locale]}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-500 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-40 overflow-hidden rounded-lg border border-divider bg-surface py-1 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {(Object.keys(LOCALE_LABEL) as Locale[]).map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                locale === code ? "bg-accent/10 text-accent-300" : "text-neutral-300 hover:bg-bg hover:text-text",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span className="w-6 font-heading text-[10px] tracking-wide text-neutral-500">{LOCALE_CODE[code]}</span>
                {LOCALE_LABEL[code]}
              </span>
              {locale === code && <Check className="h-3.5 w-3.5 flex-none" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

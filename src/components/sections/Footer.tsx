"use client";

import { Mail, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useI18n } from "@/hooks/use-i18n";
import { CARLA_INSTAGRAM_URL } from "@/i18n/translations";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="px-6 lg:px-14 py-11 bg-neutral-900 text-neutral-300 border-t border-white/12">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center flex-wrap gap-5">
        <Logo variant="inverted" height={26} />
        <div className="text-xs opacity-55">{t.footer.rights}</div>
        <div className="flex gap-4.5 text-accent-300">
          <a
            href={CARLA_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram className="w-[19px] h-[19px]" />
          </a>
          <a href="mailto:info@carlaacademy.com" aria-label="Email">
            <Mail className="w-[19px] h-[19px]" strokeWidth={1.7} />
          </a>
          <a href="tel:+18005550199" aria-label="Phone">
            <Phone className="w-[19px] h-[19px]" strokeWidth={1.7} />
          </a>
        </div>
      </div>
    </footer>
  );
}

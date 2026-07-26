"use client";

import Marquee from "react-fast-marquee";
import { useI18n } from "@/hooks/use-i18n";

export default function MarqueeSection() {
  const { t } = useI18n();

  return (
    <div className="border-y border-divider overflow-hidden py-5 bg-surface">
      <Marquee speed={40} gradient={false}>
        {t.marquee.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-8 pr-8 font-heading text-[21px] tracking-[-0.01em] whitespace-nowrap text-text/60"
          >
            {item}
            <span className="w-1.25 h-1.25 rounded-full bg-accent flex-none inline-block" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}

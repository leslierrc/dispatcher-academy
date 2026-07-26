"use client";

import { motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";

export default function FAQSection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="faq" className="border-t border-divider px-6 lg:px-14 py-[130px]">
      <div
        className="max-w-[1440px] mx-auto grid gap-20 items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))" }}
      >
        <div className="md:sticky md:top-[150px]">
          <h6 className="text-accent-700">FAQ</h6>
          <h2 className="font-heading font-normal leading-[1.08] tracking-[-0.018em] mt-2.5 max-w-[14ch] text-[clamp(30px,2.9vw,44px)]">
            {t.faq.title}
          </h2>
          <div className="flex items-center gap-3 mt-8.5 text-[13.5px] opacity-70">
            <Mail className="w-[19px] h-[19px] text-accent" strokeWidth={1.7} />
            {t.faq.help}
          </div>
        </div>

        <div ref={ref}>
          {t.faq.items.map((item, i) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 34 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: Math.min(i * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] }}
              className="border-b border-divider py-6.5 group"
            >
              <summary className="font-heading font-semibold text-lg cursor-pointer list-none flex justify-between items-center gap-6">
                {item.q}
                <span className="text-accent flex-none transition-transform group-open:rotate-45">
                  <Plus className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </span>
              </summary>
              <p className="text-[15px] leading-[1.7] opacity-75 mt-4 max-w-[66ch]">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

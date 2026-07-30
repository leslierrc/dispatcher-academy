"use client";

import { motion } from "framer-motion";
import { Truck, Users, Award, ShieldCheck } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";

const ICONS = [Truck, Users, Award, ShieldCheck];

export default function WhySection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="bg-surface border-y border-divider px-6 lg:px-14">
      <div
        className="max-w-[1440px] mx-auto grid gap-[70px] items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))" }}
      >
        <div className="md:sticky md:top-[150px] py-[120px]">
          <h6 className="text-accent-300">{t.why.kicker}</h6>
          <h2 className="font-heading font-normal leading-[1.08] tracking-[-0.018em] mt-2.5 max-w-[15ch] text-[clamp(32px,3.1vw,46px)]">
            {t.why.title}
          </h2>
          <div className="w-16 h-px bg-accent mt-7.5" />
        </div>

        <div ref={ref} className="py-[120px] flex flex-col gap-5.5">
          {t.why.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 60, rotateX: 9, scale: 0.94 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -7, scale: 1.012 }}
                className="bg-bg border border-divider rounded-lg px-10 py-9.5 flex gap-7 items-start hover:border-accent hover:shadow-lg transition-colors"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="text-accent flex-none">
                  <Icon className="w-[30px] h-[30px]" strokeWidth={1.4} />
                </div>
                <div>
                  <div className="font-heading font-semibold text-xl mb-2">{item.title}</div>
                  <div className="text-sm leading-[1.62] opacity-75 max-w-[52ch]">{item.body}</div>
                </div>
                <div className="ml-auto font-heading text-[13px] tabular-nums text-accent-400">
                  {String(i + 1).padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";

export default function StatsSection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.3);

  return (
    <section
      ref={ref}
      className="max-w-[1440px] mx-auto px-6 lg:px-14 py-24 grid"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}
    >
      {t.stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="px-7 border-l border-divider first:border-l-0 sm:first:border-l"
        >
          <div className="font-heading text-[56px] leading-none font-normal tabular-nums text-accent-300">
            {isInView ? (
              <CountUp end={s.count} duration={1.5} suffix={s.suffix} />
            ) : (
              `0${s.suffix}`
            )}
          </div>
          <div className="text-[12.5px] tracking-wide mt-3 opacity-60">{s.label}</div>
        </motion.div>
      ))}
    </section>
  );
}

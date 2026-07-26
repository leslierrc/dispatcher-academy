"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";

export default function CTASection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.2);

  return (
    <section className="bg-neutral-900 text-neutral-100 px-6 lg:px-14 py-[150px] relative overflow-hidden">
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: -160,
          left: "50%",
          marginLeft: -380,
          width: 760,
          height: 760,
          border: "1px solid color-mix(in srgb, var(--color-accent) 34%, transparent)",
        }}
        animate={{ y: [0, -22, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />

      <div ref={ref} className="max-w-[900px] mx-auto text-center relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-heading text-lg italic text-accent-300 mb-6"
        >
          {t.close.kicker}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 34 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="font-heading font-normal leading-[1.02] tracking-[-0.022em] mb-5.5 text-neutral-100 text-[clamp(42px,5vw,76px)]"
        >
          {t.close.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.12 }}
          className="text-[17px] opacity-65 mx-auto mb-11 max-w-[46ch]"
        >
          {t.close.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.24 }}
          className="flex gap-3.5 justify-center flex-wrap"
        >
          <input
            type="email"
            placeholder={t.close.placeholder}
            className="max-w-[300px] w-full min-h-13 px-4 rounded-md bg-transparent text-neutral-100 border border-white/26 focus:border-accent outline-none transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="border border-accent text-accent-300 px-7.5 py-3.5 rounded-md text-[15px] font-heading font-semibold"
          >
            {t.close.cta}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

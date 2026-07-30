"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";
import {
  carlaImage,
  CARLA_FULL_NAME,
  CARLA_INSTAGRAM_HANDLE,
  CARLA_INSTAGRAM_URL,
} from "@/i18n/translations";

export default function AboutSection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.15);
  const plateRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: plateRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.03, 1]);

  const reveal = {
    hidden: { opacity: 0, y: 34 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: Math.min(i * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <section className="border-t border-divider px-6 lg:px-14">
      <div
        className="max-w-[1440px] mx-auto grid gap-20 items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))" }}
      >
        <div className="md:sticky md:top-[118px] py-[110px]">
          <motion.div ref={plateRef} className="relative" style={{ y, scale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={carlaImage.src}
              alt={CARLA_FULL_NAME}
              className="plate w-full object-cover rounded-[4px]"
              style={{ height: 620 }}
            />
            <div className="absolute -inset-[18px] left-[18px] border border-accent rounded-[5px] -z-10" />
          </motion.div>
        </div>

        <div ref={ref} className="py-[130px] flex flex-col gap-6">
          <motion.h6
            custom={0}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-accent-300"
          >
            {t.about.kicker}
          </motion.h6>
          <motion.h2
            custom={1}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="font-heading font-normal leading-[1.06] tracking-[-0.018em] max-w-[18ch] text-[clamp(34px,3.4vw,52px)] m-0"
          >
            {t.about.title}
          </motion.h2>
          <motion.p
            custom={2}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-[16.5px] leading-[1.72] text-justify max-w-[60ch] opacity-85 m-0"
          >
            {t.about.body1}
          </motion.p>
          <motion.p
            custom={3}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-[16.5px] leading-[1.72] text-justify max-w-[60ch] opacity-85 m-0"
          >
            {t.about.body2}
          </motion.p>

          <div className="flex flex-col mt-4">
            {t.about.creds.map((cr, i) => (
              <motion.div
                key={cr}
                custom={4 + i}
                variants={reveal}
                initial="hidden"
                animate={isInView ? "show" : "hidden"}
                className="flex gap-4 items-center py-5 border-t border-divider"
              >
                <span className="text-accent flex-none">
                  <Check className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </span>
                <span className="text-[15px]">{cr}</span>
              </motion.div>
            ))}
          </div>

          <motion.a
            href={CARLA_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            custom={4 + t.about.creds.length}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 self-start border border-accent text-accent font-heading font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-accent/10 transition-colors mt-2"
          >
            <FaInstagram className="w-[18px] h-[18px]" />
            {t.about.instagramCta}
            <span className="opacity-60 font-normal">{CARLA_INSTAGRAM_HANDLE}</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

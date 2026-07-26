"use client";

import { motion } from "framer-motion";
import {
  Truck,
  FileText,
  Headphones,
  CheckCircle2,
  Laptop,
  Clock,
  TrendingUp,
  DollarSign,
  Heart,
} from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";
import { carlaDispatchImage, CARLA_FULL_NAME } from "@/i18n/translations";

const ROLE_ICONS = [Truck, FileText, Headphones, CheckCircle2];
const OPPORTUNITY_ICONS = [Laptop, Clock, TrendingUp, DollarSign, Heart];

export default function RoleSection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.15);

  const reveal = {
    hidden: { opacity: 0, y: 34 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay: Math.min(i * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <section className="px-6 lg:px-14 py-[130px]">
      <div
        className="max-w-[1440px] mx-auto grid gap-20 items-start"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))" }}
      >
        <div className="md:sticky md:top-[118px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={carlaDispatchImage.src}
            alt={CARLA_FULL_NAME}
            className="plate w-full object-cover rounded-[4px]"
            style={{ height: 460 }}
          />
        </div>

        <div ref={ref} className="flex flex-col gap-6">
          <motion.h6
            custom={0}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-accent-700"
          >
            {t.role.kicker}
          </motion.h6>
          <motion.h2
            custom={1}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="font-heading font-normal leading-[1.06] tracking-[-0.018em] max-w-[18ch] text-[clamp(32px,3.2vw,48px)] m-0"
          >
            {t.role.title}
          </motion.h2>
          <motion.p
            custom={2}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-[16.5px] leading-[1.72] max-w-[60ch] opacity-85 m-0"
          >
            {t.role.intro}
          </motion.p>

          <div className="flex flex-col mt-2">
            {t.role.bullets.map((b, i) => {
              const Icon = ROLE_ICONS[i];
              return (
                <motion.div
                  key={b}
                  custom={3 + i}
                  variants={reveal}
                  initial="hidden"
                  animate={isInView ? "show" : "hidden"}
                  className="flex gap-4 items-center py-5 border-t border-divider"
                >
                  <span className="text-accent flex-none">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[15px]">{b}</span>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            custom={3 + t.role.bullets.length}
            variants={reveal}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="bg-surface border border-divider rounded-lg px-7 py-6 mt-2"
          >
            <div className="font-heading font-semibold text-lg">{t.role.calloutTitle}</div>
            <div className="text-[15px] opacity-75 mt-1">{t.role.calloutBody}</div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-24 pt-16 border-t border-divider text-center">
        <motion.h6
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
          className="text-accent-700"
        >
          {t.role.opportunityKicker}
        </motion.h6>
        <motion.h2
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.07 }}
          className="font-heading font-normal leading-[1.08] tracking-[-0.018em] mt-2.5 mb-14 text-[clamp(30px,2.9vw,44px)]"
        >
          {t.role.opportunityTitle}
        </motion.h2>

        <div
          className="grid gap-x-10 gap-y-6 max-w-[900px] mx-auto text-left"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}
        >
          {t.role.opportunityItems.map((item, i) => {
            const Icon = OPPORTUNITY_ICONS[i];
            return (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.32) }}
                className="flex items-center gap-3.5"
              >
                <span className="text-accent flex-none">
                  <Icon className="w-5 h-5" strokeWidth={1.6} />
                </span>
                <span className="text-[15px]">{item}</span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-heading text-2xl mt-16 max-w-[36ch] mx-auto text-accent-700"
        >
          {t.role.closingLine}
        </motion.p>
      </div>
    </section>
  );
}

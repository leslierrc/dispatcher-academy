"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export default function CurriculumSection() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const barWidth = useTransform(scrollYProgress, (p) => `${Math.min(Math.max(p, 0), 1) * 100}%`);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDist(Math.max(trackRef.current.scrollWidth - window.innerWidth + 112, 0));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section id="curricula" ref={wrapRef} className="relative" style={{ height: "420vh" }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="flex items-end justify-between gap-7.5 px-6 lg:px-14 pb-11 max-w-[1440px] mx-auto w-full">
          <div>
            <h6 className="text-accent-700">{t.curriculum.kicker}</h6>
            <h2 className="font-heading font-normal leading-[1.08] tracking-[-0.018em] mt-2.5 max-w-[22ch] text-[clamp(30px,2.9vw,44px)]">
              {t.curriculum.title}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-3.5 text-xs tracking-[0.12em] uppercase text-text/48 font-heading whitespace-nowrap">
            {t.curriculum.railHint}
            <ArrowRight className="w-5 h-5 text-accent" />
          </div>
        </div>

        <div className="overflow-hidden pl-6 lg:pl-14">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-5.5 w-max">
            {t.curriculum.modules.map((m, i) => (
              <div
                key={m.title}
                className="w-[352px] flex-none border border-divider rounded-lg px-7.5 py-8.5 flex flex-col gap-3.5 bg-bg"
                style={{ minHeight: 290 }}
              >
                <div className="font-heading text-[44px] leading-none tabular-nums text-accent-300">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="w-full h-px bg-divider" />
                <div className="font-heading font-semibold text-xl leading-[1.18]">{m.title}</div>
                <div className="text-[13.5px] leading-[1.6] opacity-70">{m.body}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="pt-9.5 px-6 lg:px-14 max-w-[1440px] mx-auto w-full">
          <div className="h-px bg-divider relative">
            <motion.div className="absolute top-0 left-0 h-px bg-accent" style={{ width: barWidth }} />
          </div>
        </div>
      </div>
    </section>
  );
}

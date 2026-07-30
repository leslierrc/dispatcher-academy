"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Quote } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export default function TestimonialsSection() {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [-dist, 0]);
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

  const loop = [...t.testimonials.items, ...t.testimonials.items];

  return (
    <section id="testimonios" ref={wrapRef} className="relative" style={{ height: "320vh" }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="flex items-end justify-between gap-7.5 px-6 lg:px-14 pb-11 max-w-[1440px] mx-auto w-full">
          <div>
            <h6 className="text-accent-300">{t.testimonials.kicker}</h6>
            <h2 className="font-heading font-normal leading-[1.08] tracking-[-0.018em] mt-2.5 max-w-[22ch] text-[clamp(30px,2.9vw,44px)]">
              {t.testimonials.title}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-3.5 text-xs tracking-[0.12em] uppercase text-text/48 font-heading whitespace-nowrap">
            <ArrowLeft className="w-5 h-5 text-accent" />
            {t.curriculum.railHint}
          </div>
        </div>

        <div className="overflow-hidden pr-6 lg:pr-14">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-6.5 w-max justify-end">
            {loop.map((tst, i) => (
              <div
                key={`${tst.name}-${i}`}
                className="w-[430px] flex-none border border-divider rounded-lg px-8 py-9 flex flex-col gap-5.5 bg-bg shadow-sm"
              >
                <Quote className="w-7.5 h-7.5 text-accent opacity-45" />
                <p className="text-base leading-[1.66] m-0 opacity-90">{tst.quote}</p>
                <div className="flex items-center gap-3.5 mt-auto pt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tst.src}
                    alt={tst.name}
                    className="w-13 h-13 rounded-full object-cover flex-none"
                  />
                  <div>
                    <div className="font-heading font-semibold text-[15px]">{tst.name}</div>
                    <div className="text-[11.5px] opacity-60 tracking-wide">{tst.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="pt-9.5 px-6 lg:px-14 max-w-[1440px] mx-auto w-full">
          <div className="h-px bg-divider relative">
            <motion.div className="absolute top-0 right-0 h-px bg-accent" style={{ width: barWidth }} />
          </div>
        </div>
      </div>
    </section>
  );
}

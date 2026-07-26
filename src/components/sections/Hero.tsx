"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";
import CountUp from "react-countup";
import { useI18n } from "@/hooks/use-i18n";
import { heroImage, carlaChipImage, CARLA_FULL_NAME } from "@/i18n/translations";

const HERO_VIDEO = "/videos/hero.mp4";

export default function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollP = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const plateScale = useTransform(scrollP, (p) => 1 - p * 0.05);
  const rotateY = useTransform([scrollP, mx], ([p, m]) => -7 + (p as number) * 7 + (m as number) * 6);
  const rotateX = useTransform([scrollP, my], ([p, m]) => 3 - (p as number) * 3 - (m as number) * 5);
  // The frame (border + badges) only ever translates — never rotates — so it stays crisp.
  // The mouse-reactive "card following the cursor" feel now lives here instead of on the
  // rotation, with the photo's own tilt (rotateX/rotateY above) adding the depth on top.
  const plateY = useTransform([scrollP, my], ([p, m]) => (p as number) * 74 + (m as number) * -16);
  const plateX = useTransform(mx, (m) => m * 22);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const words = t.hero.title.split(" ");

  return (
    <section
      id="top"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[104vh] overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          style={{ filter: "sepia(0.25) saturate(0.7) contrast(1.05)" }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-bg/50" />
        <div
          className="absolute inset-x-0 bottom-0 h-[280px]"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg))" }}
        />
      </div>

      <div
        className="relative grid gap-14 items-center px-6 lg:px-14 pt-[150px] pb-24 max-w-[1440px] mx-auto"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(440px, 100%), 1fr))" }}
      >
        <motion.div
          className="absolute rounded-full border border-divider pointer-events-none hidden md:block"
          style={{ top: "6%", right: "4%", width: 520, height: 520 }}
          animate={{ y: [0, -22, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full border border-accent pointer-events-none hidden md:block"
          style={{ top: "34%", right: "26%", width: 150, height: 150 }}
          animate={{ scale: [0.85, 1.7], opacity: [0.5, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute rounded-full border border-divider pointer-events-none hidden md:block"
          style={{ bottom: "8%", left: -90, width: 340, height: 340 }}
          animate={{ y: [0, 22, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 border border-accent rounded-full px-4 py-1.5 text-[11.5px] tracking-[0.13em] uppercase text-accent-700 font-heading"
        >
          <span className="w-[5px] h-[5px] rounded-full bg-accent inline-block" />
          {t.hero.kicker}
        </motion.div>

        <h1 className="font-heading font-normal leading-[0.98] tracking-[-0.022em] my-6 max-w-[15ch] text-[clamp(50px,5.4vw,82px)] text-balance">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em]">
              <motion.span
                className="inline-block"
                initial={{ y: "105%", rotate: 3 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1.05, delay: 0.12 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[18.5px] leading-[1.62] max-w-[480px] mb-9 text-text/80"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap gap-4 items-center"
        >
          <motion.a
            href="#precios"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-[15px] px-7 py-3.5 border border-accent text-accent font-heading font-semibold rounded-md hover:bg-accent/10 transition-colors"
          >
            {t.hero.cta1}
          </motion.a>
          <motion.a
            href="#curricula"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-[15px] px-7 py-3.5 border border-divider text-text font-heading font-semibold rounded-md hover:bg-text/5 transition-colors"
          >
            {t.hero.cta2}
          </motion.a>
        </motion.div>

        <div className="flex items-center gap-2.5 mt-[70px] text-[11px] tracking-[0.14em] uppercase text-text/45 font-heading">
          <motion.span
            className="w-px h-[26px] bg-divider inline-block"
            animate={{ y: [0, 9, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {t.hero.scrollCue}
        </div>
      </div>

      <div className="relative z-[1]" style={{ perspective: 1400 }}>
        <motion.div
          className="relative"
          style={{
            x: plateX,
            y: plateY,
            scale: plateScale,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Static frame — never rotates, so its border/outline always stays crisp. */}
          <div className="plate-frame relative overflow-hidden rounded-[5px]" style={{ height: 600 }}>
            {/* Only the photo itself tilts in 3D; scaled up slightly so rotation never reveals empty corners. */}
            <motion.div
              className="absolute inset-0"
              style={{
                rotateY,
                rotateX,
                scale: 1.12,
                transformStyle: "preserve-3d",
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage.src}
                alt={t.hero.title}
                className="w-full h-full object-cover"
                style={{ filter: "sepia(0.22) saturate(0.82) contrast(1.05)" }}
              />
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-3.5 right-3.5 max-w-[calc(100%-28px)] bg-bg border border-divider rounded-md shadow-lg px-5.5 py-4 flex items-center gap-3.5"
            style={{
              z: 70,
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={carlaChipImage.src}
              alt={CARLA_FULL_NAME}
              className="w-[46px] h-[46px] rounded-full object-cover flex-none"
            />
            <div>
              <div className="font-heading font-semibold text-[14.5px] whitespace-nowrap">{CARLA_FULL_NAME}</div>
              <div className="text-[11px] opacity-60">{t.hero.cardRole}</div>
            </div>
          </motion.div>

          <motion.div
            className="absolute top-3.5 left-3.5 bg-bg border border-accent rounded-md px-4.5 py-3 font-heading"
            style={{
              z: 110,
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            <div className="text-[23px] tabular-nums text-accent-700">
              <CountUp end={500} duration={1.5} enableScrollSpy scrollSpyOnce suffix="+" />
            </div>
            <div className="text-[10.5px] tracking-[0.1em] uppercase opacity-60">
              {t.hero.chipStudents}
            </div>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </section>
  );
}

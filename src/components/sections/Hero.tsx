"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import CountUp from "react-countup";
import { useI18n } from "@/hooks/use-i18n";

const ROTATING_WORDS_ES = [
  { word: "APRENDER", desc: "El oficio que te da herramientas reales" },
  { word: "CRECER", desc: "De donde estás a donde quieres llegar" },
  { word: "GANAR", desc: "Ingresos propios en USD desde tu casa" },
  { word: "VIVIR", desc: "La libertad de trabajar desde cualquier lugar" },
];

const ROTATING_WORDS_EN = [
  { word: "LEARN", desc: "The craft that gives you real tools" },
  { word: "GROW", desc: "From where you are to where you want to be" },
  { word: "EARN", desc: "Your own income in USD from home" },
  { word: "LIVE", desc: "The freedom to work from anywhere" },
];

function useRotatingWord(locale: string) {
  const words = locale === "en" ? ROTATING_WORDS_EN : ROTATING_WORDS_ES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [words.length]);

  return words[index];
}

const charReveal = (delayBase: number) => ({
  initial: {
    opacity: 0,
    y: 80,
    scaleY: 2.4,
    scaleX: 0.3,
    filter: "blur(18px)",
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scaleY: 1,
    scaleX: 1,
    filter: "blur(0px)",
    transition: {
      delay: delayBase + i * 0.028,
      type: "spring" as const,
      damping: 11,
      stiffness: 110,
      mass: 0.6,
    },
  }),
});

const rotatingChar = {
  initial: {
    opacity: 0,
    y: 50,
    rotateZ: 8,
    scale: 0.4,
    filter: "blur(10px)",
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateZ: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.032,
      type: "spring" as const,
      damping: 10,
      stiffness: 130,
      mass: 0.5,
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -60,
    rotateZ: -10,
    scale: 0.6,
    filter: "blur(14px)",
    transition: {
      delay: i * 0.015,
      duration: 0.35,
      ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],
    },
  }),
};

export default function Hero() {
  const { t, locale } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const rotating = useRotatingWord(locale);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const bgBrightness = useTransform(scrollYProgress, [0.55, 1], [1, 0.55]);
  const contentOpacity = useTransform(scrollYProgress, [0.12, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -70]);
  const scrimOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 0.7]);
  const cueScrollOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const bgFilter = useTransform(bgBrightness, (b) => `brightness(${b})`);

  const isES = locale === "es";
  const prefix = isES ? "LA PLATAFORMA" : "THE PLATFORM";
  const preposition = isES ? "PARA" : "TO";
  const tagline = isES
    ? "Doce módulos en español, con plantillas, práctica real y acompañamiento hasta tu primera carga despachada."
    : "Twelve modules in Spanish, with templates, real practice and support until your first dispatched load.";

  return (
    <section id="top" ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen min-h-[700px] max-h-[960px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale: bgScale, filter: bgFilter }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/hero.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1817]/80 via-[#1a1817]/50 to-[#1a1817]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1817]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1817]/70 via-transparent to-[#1a1817]/20" />

        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(168,114,122,0.08), transparent 60%)",
          }}
        />

        <motion.div
          className="absolute inset-0 bg-black z-[5]"
          style={{ opacity: scrimOpacity }}
        />

        <div className="absolute inset-0 grid-bg" />

        <motion.div
          className="absolute bottom-24 right-8 z-20 flex items-center gap-3 bg-[#1a1817]/60 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="font-heading text-[24px] leading-none tabular-nums text-accent-300">
            <CountUp
              end={500}
              duration={1.5}
              enableScrollSpy
              scrollSpyOnce
              suffix="+"
            />
          </div>
          <div className="text-[10px] tracking-[0.12em] uppercase text-text/60 leading-tight font-accent">
            {isES ? "Alumnos" : "Students"}
            <br />
            {isES ? "formados" : "trained"}
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-14 max-w-[1440px] mx-auto"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="max-w-[900px]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-flex items-center gap-2.5 border border-accent/40 rounded-full px-4 py-1.5 text-[11px] tracking-[0.18em] uppercase text-accent-300 font-accent mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              7 DIGITAL LLC &middot;{" "}
              {isES
                ? "CERTIFICACIÓN EN DESPACHO DE FLETES"
                : "FREIGHT DISPATCH CERTIFICATION"}
            </motion.div>

            <h1 className="font-heading font-light leading-[0.92] tracking-[-0.03em] text-balance">
              <span className="text-[clamp(52px,7.5vw,110px)] block text-white">
                {prefix.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={charReveal(0.2)}
                    initial="initial"
                    animate="animate"
                    custom={i}
                    className="inline-block"
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </span>

              <span className="text-[clamp(52px,7.5vw,110px)] block mt-1">
                {preposition.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={charReveal(0.55)}
                    initial="initial"
                    animate="animate"
                    custom={i}
                    className="inline-block text-white/70 font-accent font-semibold tracking-[0.08em]"
                    style={{ fontSize: "clamp(28px,4vw,60px)" }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </span>

              <span className="text-[clamp(64px,9vw,130px)] block mt-2 leading-[0.95]">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={rotating.word}
                    variants={rotatingChar}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={0}
                    className="inline-block bg-gradient-to-r from-accent-300 via-accent-200 to-accent-300 bg-clip-text text-transparent font-heading font-bold"
                  >
                    {rotating.word.split("").map((ch, i) => (
                      <motion.span
                        key={i}
                        variants={rotatingChar}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        custom={i}
                        className="inline-block"
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <motion.p
              key={rotating.desc}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15px] md:text-[17px] leading-[1.6] max-w-[560px] mt-5 text-text/60 font-body"
            >
              {rotating.desc}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14px] md:text-[16px] leading-[1.65] max-w-[540px] mt-1 text-text/45 font-body"
            >
              {tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4 items-center mt-10"
            >
              <motion.a
                href="#precios"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="text-[15px] px-9 py-4 bg-accent-600 text-[#fbf7f5] font-heading font-semibold rounded-md hover:bg-accent-700 transition-colors shadow-lg shadow-accent/20 tracking-wide"
              >
                {isES ? "QUIERO EMPEZAR" : "ENROLL NOW"}
              </motion.a>
              <motion.a
                href="#curricula"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="text-[15px] px-9 py-4 border border-white/15 text-text/85 font-heading font-semibold rounded-md hover:bg-white/5 transition-colors backdrop-blur-sm tracking-wide"
              >
                {isES ? "VER PROGRAMA" : "VIEW PROGRAM"}
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-[#1a1817]/60 backdrop-blur-md border-t border-white/5">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-4 flex justify-between gap-4 flex-wrap">
              {t.stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="font-heading text-[28px] md:text-[34px] leading-none tabular-nums text-accent-300">
                    {i < 2 ? (
                      <CountUp end={s.count} duration={2.5} suffix={s.suffix} />
                    ) : (
                      <>
                        {s.count}
                        {s.suffix}
                      </>
                    )}
                  </div>
                  <div className="text-[11px] md:text-[12px] leading-tight text-text/50 uppercase tracking-[0.08em] max-w-[10ch] font-accent">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-36 right-8 z-10 hidden md:flex flex-col items-center gap-2"
          style={{ opacity: cueScrollOpacity }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 1.6 }}
          >
            <span className="text-[9px] tracking-[0.25em] uppercase text-white/50 font-accent vertical-rl [writing-mode:vertical-rl]">
              {t.hero.scrollCue}
            </span>
            <motion.div
              className="w-px h-16 bg-gradient-to-b from-accent to-transparent"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

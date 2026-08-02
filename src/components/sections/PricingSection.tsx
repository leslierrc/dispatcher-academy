"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useInView } from "@/hooks/use-animations";
import { getPricingCourses } from "@/actions/public";
import CheckoutButton from "@/components/checkout/checkout-button";
import type { Course } from "@/lib/types";

export default function PricingSection() {
  const { t } = useI18n();
  const { ref, isInView } = useInView(0.1);
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    getPricingCourses().then(setCourses);
  }, []);

  return (
    <section id="precios" className="relative p-0">
      <div className="bg-neutral-900 text-neutral-100 px-6 lg:px-14 py-[140px]">
        <div ref={ref} className="max-w-[1440px] mx-auto" style={{ perspective: 1600 }}>
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-[640px] mx-auto mb-18"
          >
            <h6 className="text-accent-300">{t.pricing.kicker}</h6>
            <h2 className="font-heading font-normal leading-[1.06] tracking-[-0.018em] my-2.5 text-neutral-100 text-[clamp(34px,3.4vw,50px)]">
              {t.pricing.title}
            </h2>
            <p className="text-[15px] opacity-60 m-0">{t.pricing.subtitle}</p>
          </motion.div>

          {courses === null && (
            <div className="text-center text-sm opacity-50">Cargando planes…</div>
          )}

          {courses?.length === 0 && (
            <div className="text-center text-sm opacity-50">Todavía no hay cursos publicados.</div>
          )}

          {courses?.map((course) => (
            <div key={course.id} className="mb-16 last:mb-0">
              {courses.length > 1 && (
                <h3 className="font-heading text-2xl text-neutral-100 mb-8 text-center">{course.title}</h3>
              )}
              <div
                className="grid gap-6.5 items-start"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}
              >
                {(course.plans ?? []).map((plan, i) => {
                  const featured = !!plan.badge;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 80, rotateY: (i - 1) * 12, rotateX: 8 }}
                      animate={isInView ? { opacity: 1, y: featured ? -26 : 0, rotateY: 0, rotateX: 0 } : {}}
                      transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-lg px-8.5 py-11 relative"
                      style={{
                        border: `1px solid ${featured ? "var(--color-accent)" : "rgba(248,244,244,0.2)"}`,
                        background: featured
                          ? "color-mix(in srgb, var(--color-accent) 9%, var(--color-neutral-900))"
                          : "transparent",
                        boxShadow: featured ? "0 26px 70px rgba(0,0,0,0.45)" : "none",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {featured && (
                        <div className="absolute -top-3.25 left-8.5 border border-accent bg-neutral-900 text-accent-300 text-[10.5px] tracking-[0.12em] uppercase px-3.25 py-1.25 rounded-full font-heading">
                          {plan.badge}
                        </div>
                      )}
                      <div className="font-heading font-semibold text-[22px] text-neutral-100">{plan.name}</div>
                      <div className="text-[13px] opacity-55 mt-1.5 mb-6.5 text-neutral-300">{plan.description}</div>
                      <div className="flex items-baseline gap-2 pb-6.5 border-b border-white/16">
                        <div className="font-heading text-[52px] leading-none tabular-nums text-neutral-100">
                          ${Number(plan.price).toLocaleString("en-US")}
                        </div>
                        <div className="text-[12.5px] opacity-50 text-neutral-300">{t.pricing.oneTime}</div>
                      </div>
                      <div className="flex flex-col gap-3.5 my-6.5">
                        {(plan.features ?? []).map((f) => (
                          <div key={f} className="flex gap-2.75 items-start text-sm leading-[1.5] text-neutral-200">
                            <span className="text-accent-300 flex-none mt-0.5">
                              <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                            </span>
                            {f}
                          </div>
                        ))}
                      </div>
                      <CheckoutButton
                        planId={plan.id}
                        className="flex justify-center items-center w-full rounded-md px-4 py-3.5 text-sm font-heading font-semibold transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-60"
                        style={{
                          border: `1px solid ${featured ? "var(--color-accent)" : "rgba(248,244,244,0.34)"}`,
                          color: featured ? "var(--color-accent-300)" : "var(--color-neutral-200)",
                        }}
                      >
                        Empezar
                      </CheckoutButton>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center gap-3 mt-11 text-[13px] opacity-55">
            <ShieldCheck className="w-[19px] h-[19px] text-accent-300" strokeWidth={1.6} />
            {t.pricing.guarantee}
          </div>
        </div>
      </div>
    </section>
  );
}

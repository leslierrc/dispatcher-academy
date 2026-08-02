"use client";

import { Check } from "lucide-react";
import CheckoutButton from "@/components/checkout/checkout-button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Course } from "@/lib/types";
import type { AppT } from "@/i18n/app";

export default function CoursePlansDialog({
  course,
  open,
  onOpenChange,
  t,
}: {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  t: AppT;
}) {
  const plans = course.plans ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>{course.description || t.coursePlansDialog.choosePlan}</DialogDescription>
        </DialogHeader>

        {plans.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">{t.coursePlansDialog.noPlans}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-3 rounded-lg border border-divider bg-bg p-5"
                style={plan.badge ? { borderColor: "var(--color-accent)" } : undefined}
              >
                <div>
                  <h3 className="font-heading text-lg text-text">{plan.name}</h3>
                  {plan.badge && <Badge className="mt-1.5">{plan.badge}</Badge>}
                </div>
                <div className="font-heading text-2xl text-text">
                  ${Number(plan.price).toLocaleString("en-US")}
                  <span className="ml-1 text-xs font-body text-neutral-400">{t.coursePlansDialog.oneTime}</span>
                </div>
                <p className="text-xs text-neutral-400">{plan.description}</p>
                <ul className="flex flex-col gap-1.5">
                  {(plan.features ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-accent-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <CheckoutButton planId={plan.id} className={buttonVariants({ className: "w-full mt-auto" })}>
                  {t.coursePlansDialog.choose} {plan.name}
                </CheckoutButton>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

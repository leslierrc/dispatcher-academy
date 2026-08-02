"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, getStripePriceId } from "@/lib/stripe";

export async function checkout(planId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("plans")
    .select("*, course:course_id(slug, title)")
    .eq("id", planId)
    .eq("active", true)
    .single();

  if (!plan || !plan.course_id || !plan.tier) return { error: "Plan no encontrado" };

  let priceId = plan.stripe_price_id;
  if (!priceId) {
    const price = await getStripePriceId(Number(plan.price), plan.interval, `${plan.course.title} — ${plan.name}`);
    priceId = price.id;
    await supabase.from("plans").update({ stripe_price_id: priceId }).eq("id", plan.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await createCheckoutSession({
    customerEmail: user.email!,
    priceId,
    successUrl: `${appUrl}/dashboard?checkout=success&course=${plan.course.slug}`,
    cancelUrl: `${appUrl}/pricing`,
    metadata: {
      user_id: user.id,
      plan_id: plan.id,
      plan_name: plan.name,
      course_id: plan.course_id,
      tier: plan.tier,
    },
  });

  redirect(session.url!);
}

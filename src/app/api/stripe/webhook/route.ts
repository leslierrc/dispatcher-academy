import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPurchaseSuccessEmail, sendPurchaseFailedEmail } from "@/services/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotencia: no procesar el mismo evento dos veces
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("stripe_events").insert({
    event_id: event.id,
    type: event.type,
    payload: event.data.object as object,
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, plan_id, plan_name, course_id, tier } = session.metadata ?? {};
      const email = session.customer_details?.email ?? session.customer_email;

      if (user_id && plan_id && course_id && tier) {
        // Inserta o actualiza la suscripción
        await supabase.from("subscriptions").upsert(
          {
            user_id,
            plan_id,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
            status: "active",
            current_period_end: null,
          },
          { onConflict: "user_id" },
        );

        // Inscribe al alumno SOLO en el curso comprado, con el nivel
        // que pagó (básico/medio/pro). Si ya estaba inscrito con un
        // nivel menor, esto lo sube al que acaba de pagar.
        await supabase
          .from("enrollments")
          .upsert({ user_id, course_id, tier }, { onConflict: "user_id,course_id" });

        if (email) {
          await sendPurchaseSuccessEmail(email, email, plan_name ?? "el curso");
        }
      }
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email;
      if (email) {
        await sendPurchaseFailedEmail(email, email);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (typeof invoice.customer === "string") {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", invoice.customer)
          .maybeSingle();
        if (sub) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_customer_id", invoice.customer);
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

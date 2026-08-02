import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPurchaseSuccessEmail, sendPurchaseFailedEmail } from "@/services/email";

export const dynamic = "force-dynamic";

// Desde Stripe API 2025+, current_period_end vive en cada subscription
// item, no en el nivel superior de la suscripción.
function periodEndOf(subscription: Stripe.Subscription): string | null {
  const seconds = subscription.items.data[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

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
        let currentPeriodEnd: string | null = null;
        if (typeof session.subscription === "string") {
          const subscription = await getStripe().subscriptions.retrieve(session.subscription);
          currentPeriodEnd = periodEndOf(subscription);
        }

        // Una fila nueva por compra: un alumno puede tener varias
        // suscripciones activas a la vez (una por curso). No hay
        // conflicto posible en un insert — cada checkout crea una
        // suscripción de Stripe con id nuevo (stripe_subscription_id
        // ya es unique), y la deduplicación de webhooks repetidos ya
        // se resolvió arriba con stripe_events.
        await supabase.from("subscriptions").insert({
          user_id,
          plan_id,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          status: "active",
          current_period_end: currentPeriodEnd,
        });

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

    case "invoice.payment_succeeded": {
      // Renovación mensual exitosa: extiende el acceso y, si venía de
      // un cobro fallido, reactiva la suscripción. Desde la API 2025+
      // la suscripción de la factura vive en parent.subscription_details.
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
      if (subscriptionId) {
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        await supabase
          .from("subscriptions")
          .update({ status: "active", current_period_end: periodEndOf(subscription) })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    case "invoice.payment_failed": {
      // Solo marca "past_due" la suscripción puntual cuya factura
      // falló — un alumno puede tener otros cursos pagando bien bajo
      // el mismo customer de Stripe, y no deben verse afectados.
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

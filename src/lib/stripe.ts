import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY no está configurado");
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export async function createCheckoutSession({
  customerEmail,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
  });
}

export async function getStripePriceId(
  price: number,
  interval: "one_time" | "month" | "year",
  name: string,
) {
  const amount = Math.round(price * 100);
  const productName = `Plan ${name}`;

  return getStripe().prices.create({
    unit_amount: amount,
    currency: "usd",
    ...(interval === "one_time" ? {} : { recurring: { interval } }),
    product_data: { name: productName },
  });
}

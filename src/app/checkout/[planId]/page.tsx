import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth-helpers";
import { checkout } from "@/actions/checkout";

// Punto de entrada único para comprar un plan: si no está logueado,
// lo manda a loguearse (o registrarse) y vuelve acá solo al terminar;
// si ya está logueado, lo manda directo a Stripe. Así el botón "Elegir
// plan" de la landing (sin sesión) y del dashboard (con sesión) hacen
// lo mismo sin duplicar lógica.
export default async function CheckoutRedirectPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${planId}`)}`);
  }

  const result = await checkout(planId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-red-300">{result?.error || "No se pudo iniciar el pago."}</p>
      <Link href="/pricing" className="text-accent-300 hover:underline">
        Volver a precios
      </Link>
    </main>
  );
}

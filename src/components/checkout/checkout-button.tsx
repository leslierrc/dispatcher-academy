import Link from "next/link";

// Va a /checkout/[planId], que decide: si no hay sesión, pasa primero
// por login/registro y vuelve acá solo; si ya está logueado, sigue
// directo a Stripe. Mismo componente sirve logueado o no.
export default function CheckoutButton({
  planId,
  className,
  style,
  children,
}: {
  planId: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/checkout/${planId}`} className={className} style={style}>
      {children}
    </Link>
  );
}

"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { checkout } from "@/actions/checkout";

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
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await checkout(planId);
        });
      }}
      className={className}
      style={style}
    >
      {pending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

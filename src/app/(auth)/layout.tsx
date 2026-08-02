import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg grid-bg flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-14 py-6">
        <Link href="/" aria-label="Volver al inicio">
          <Logo height={28} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-10">{children}</main>
      <footer className="px-6 py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} 7 Digital LLC
      </footer>
    </div>
  );
}

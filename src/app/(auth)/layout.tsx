import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { getT } from "@/lib/locale";
import { AppI18nProvider } from "@/hooks/use-app-i18n";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getT();

  return (
    <AppI18nProvider initialLocale={locale}>
      <div className="min-h-screen bg-bg grid-bg flex flex-col">
        <header className="flex items-center justify-between px-6 lg:px-14 py-6">
          <Link href="/" aria-label={t.shell.backToHome}>
            <Logo height={28} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-accent-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.shell.backToHome}
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-10">{children}</main>
        <footer className="px-6 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} 7 Digital LLC
        </footer>
      </div>
    </AppI18nProvider>
  );
}

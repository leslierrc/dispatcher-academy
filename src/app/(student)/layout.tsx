import { requireUser } from "@/lib/auth-helpers";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getLocale } from "@/lib/locale";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, initialLocale] = await Promise.all([requireUser(), getLocale()]);

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.profile?.name ?? null,
        email: user.profile?.email ?? null,
        role: user.profile?.role ?? "student",
      }}
      initialLocale={initialLocale}
    >
      {children}
    </DashboardShell>
  );
}

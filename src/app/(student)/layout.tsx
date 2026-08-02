import { requireUser } from "@/lib/auth-helpers";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.profile?.name ?? null,
        email: user.profile?.email ?? null,
        role: user.profile?.role ?? "student",
      }}
    >
      {children}
    </DashboardShell>
  );
}

import { requireAdmin } from "@/lib/auth-helpers";
import AdminShell from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.profile?.name ?? null,
        email: user.profile?.email ?? null,
        role: user.profile?.role ?? "admin",
      }}
    >
      {children}
    </AdminShell>
  );
}

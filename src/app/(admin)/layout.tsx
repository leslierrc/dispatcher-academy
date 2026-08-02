import { requireAdmin } from "@/lib/auth-helpers";
import AdminShell from "@/components/admin/admin-shell";
import { getLocale } from "@/lib/locale";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, initialLocale] = await Promise.all([requireAdmin(), getLocale()]);

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.profile?.name ?? null,
        email: user.profile?.email ?? null,
        role: user.profile?.role ?? "admin",
      }}
      initialLocale={initialLocale}
    >
      {children}
    </AdminShell>
  );
}

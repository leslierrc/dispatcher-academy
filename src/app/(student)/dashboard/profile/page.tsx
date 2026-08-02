import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import ProfileForm from "@/components/dashboard/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-text">Mi Perfil</h1>
        <p className="mt-1 text-neutral-400">Actualiza tu información personal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.profile?.name ?? null}
            email={user.profile?.email ?? null}
            phone={user.profile?.phone ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

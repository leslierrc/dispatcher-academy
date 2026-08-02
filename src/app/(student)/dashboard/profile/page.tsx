import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { getT } from "@/lib/locale";
import ProfileForm from "@/components/dashboard/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default async function ProfilePage() {
  const [user, { t }] = await Promise.all([requireUser(), getT()]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-text">{t.profile.title}</h1>
        <p className="mt-1 text-neutral-400">{t.profile.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.profile.personalInfo}</CardTitle>
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

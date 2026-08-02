import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";
import { getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, { t }] = await Promise.all([searchParams, getT()]);

  return (
    <AuthCard title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      <RegisterForm next={next} />
    </AuthCard>
  );
}

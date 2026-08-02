import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Nueva contraseña",
};

export default async function ResetPasswordPage() {
  const { t } = await getT();

  return (
    <AuthCard title={t.auth.resetPasswordTitle} subtitle={t.auth.resetPasswordCardSubtitle}>
      <ResetPasswordForm />
    </AuthCard>
  );
}

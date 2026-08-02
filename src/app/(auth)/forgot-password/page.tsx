import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { getT } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default async function ForgotPasswordPage() {
  const { t } = await getT();

  return (
    <AuthCard title={t.auth.forgotPasswordTitle} subtitle={t.auth.forgotPasswordCardSubtitle}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}

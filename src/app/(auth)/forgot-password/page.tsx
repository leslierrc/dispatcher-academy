import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Recupera tu contraseña" subtitle="No te preocupes, te ayudamos a recuperarla.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}

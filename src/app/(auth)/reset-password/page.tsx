import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nueva contraseña",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Nueva contraseña" subtitle="Elige una contraseña nueva para tu cuenta.">
      <ResetPasswordForm />
    </AuthCard>
  );
}

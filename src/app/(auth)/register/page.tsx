import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <AuthCard title="Crea tu cuenta" subtitle="Empieza tu camino como dispatcher hoy mismo.">
      <RegisterForm />
    </AuthCard>
  );
}

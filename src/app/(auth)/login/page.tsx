import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <AuthCard title="Bienvenido de nuevo" subtitle="Ingresa para continuar con tu formación.">
      <LoginForm />
    </AuthCard>
  );
}

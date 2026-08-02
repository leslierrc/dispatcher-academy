"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendResetPasswordEmail, sendWelcomeEmail } from "@/services/email";
import { getAppUrl } from "@/lib/constants";
import { getT } from "@/lib/locale";
import type { AppT } from "@/i18n/app";

export type AuthState = {
  error?: string;
  success?: string;
};

function loginSchema(t: AppT) {
  return z.object({
    email: z.string().email(t.actions.auth.invalidEmail),
    password: z.string().min(6, t.actions.auth.passwordMinChars),
  });
}

function isAdminEmail(email: string | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

function registerSchema(t: AppT) {
  return z.object({
    name: z.string().min(2, t.actions.auth.fullNameRequired),
    email: z.string().email(t.actions.auth.invalidEmail),
    password: z.string().min(6, t.actions.auth.passwordMin6),
    redirect: z.string().optional(),
  });
}

export async function login(prev: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getT();
  const parsed = loginSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: t.actions.auth.invalidCredentials };
    }
    return { error: error.message };
  }

  const next = formData.get("next") as string | null;
  if (next) redirect(next);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin" || isAdminEmail(parsed.data.email);
  redirect(isAdmin ? "/admin" : "/dashboard");
}

export async function register(prev: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getT();
  const parsed = registerSchema(t).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const next = formData.get("next") as string | null;

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${getAppUrl()}${next || "/dashboard"}`,
    },
  });

  if (error) return { error: error.message };

  await sendWelcomeEmail(parsed.data.email, parsed.data.name);

  // Si el email requiere confirmación, mostramos mensaje.
  if (data.session) {
    redirect(next || "/dashboard");
  }
  return { success: t.actions.auth.checkEmailToConfirm };
}

export async function forgotPassword(prev: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getT();
  const email = String(formData.get("email") || "").trim();
  if (!z.string().email().safeParse(email).success) {
    return { error: t.actions.auth.invalidEmail };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/reset-password`,
  });

  if (error) return { error: error.message };

  await sendResetPasswordEmail(
    email,
    `${getAppUrl()}/reset-password?email=${encodeURIComponent(email)}`,
  );

  return { success: t.actions.auth.resetInstructionsSent };
}

export async function updatePassword(prev: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getT();
  const password = String(formData.get("password") || "");
  if (password.length < 6) {
    return { error: t.actions.auth.passwordMinChars };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

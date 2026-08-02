import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

function isAdminEmail(email: string | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

function normalizeRole(role: string | undefined | null, email: string | null | undefined) {
  if (role === "admin") return "admin";
  if (isAdminEmail(email)) return "admin";
  return role ?? "student";
}

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  profile: Profile;
}

async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let profile: Partial<Profile> | null = null;
  let profileError: { code?: string; message?: string } | null = null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    profile = data as Partial<Profile> | null;
    profileError = error as { code?: string; message?: string } | null;
  } catch (error) {
    profileError = error as { code?: string; message?: string };
  }

  if (profileError && profileError.code !== "PGRST116") {
    console.warn("Profile unavailable, using auth fallback", profileError.message ?? profileError);
  }

  const effectiveRole = normalizeRole(profile?.role as string | undefined, user.email);
  const resolvedProfile: Profile = {
    id: user.id,
    name: (profile?.name as string | null) ?? ((user.user_metadata?.name as string | undefined) ?? user.email ?? null),
    email: (profile?.email as string | null) ?? user.email ?? null,
    role: effectiveRole as Profile["role"],
    status: (profile?.status as Profile["status"]) ?? "active",
    avatar_url: (profile?.avatar_url as string | null) ?? null,
    phone: (profile?.phone as string | null) ?? null,
    created_at: (profile?.created_at as string | undefined) ?? new Date().toISOString(),
    updated_at: (profile?.updated_at as string | undefined) ?? new Date().toISOString(),
  };

  return {
    id: user.id,
    email: user.email ?? null,
    name: resolvedProfile.name,
    profile: resolvedProfile,
  };
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile?.status === "suspended") redirect("/login?error=suspended");
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = normalizeRole(session.profile?.role, session.email) === "admin" || isAdminEmail(session.email);

  if (!isAdmin) redirect("/dashboard");
  return { ...session, profile: { ...session.profile, role: "admin" as Profile["role"] } };
}

export async function requireStudent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = normalizeRole(session.profile?.role, session.email) === "admin" || isAdminEmail(session.email);

  if (isAdmin) redirect("/admin");
  return { ...session, profile: { ...session.profile, role: (isAdmin ? "admin" : normalizeRole(session.profile?.role, session.email)) as Profile["role"] } };
}

export async function getUser() {
  return getSession();
}

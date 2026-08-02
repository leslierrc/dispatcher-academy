import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isAdminEmail(email: string | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password");
  const isStudentRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/courses") || pathname.startsWith("/lessons") || pathname.startsWith("/profile");
  const isAdminRoute = pathname.startsWith("/admin");

  // Ruta protegida sin sesión → login
  if (!user && (isStudentRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Para rutas de auth (con sesión) y rutas admin, necesitamos saber el rol.
  let effectiveRole: "admin" | "student" | null = null;
  if (user && (isAuthRoute || isAdminRoute)) {
    // Usa el cliente atado a la sesión (respeta RLS vía "users read own
    // profile"): no depende del service role key, que en producción a
    // veces no está bien configurado.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    effectiveRole = profile?.role === "admin" || isAdminEmail(user.email) ? "admin" : "student";
  }

  // Rutas de auth con sesión → dashboard (o admin, según el rol)
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = effectiveRole === "admin" ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Ruta admin sin rol admin → prohibido
  if (user && isAdminRoute && effectiveRole !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

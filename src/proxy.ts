import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Rutas que requieren sesión o redirección:
     * - /login, /register, /forgot-password, /reset-password
     * - /dashboard, /dashboard/* (alumno)
     * - /admin, /admin/* (admin)
     */
    "/login/:path*",
    "/register/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};

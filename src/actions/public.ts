"use server";

import { getPublishedCoursesWithPlans } from "@/lib/data";

// Datos públicos para /pricing y la sección de precios de la home.
// Es una Server Action (no una simple función de lib/data) porque la
// sección de precios se carga del lado del cliente (animaciones con
// next/dynamic ssr:false) y necesita poder pedir estos datos ella sola.
export async function getPricingCourses() {
  return getPublishedCoursesWithPlans();
}

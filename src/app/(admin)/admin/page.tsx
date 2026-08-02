import Link from "next/link";
import { BookOpen, DollarSign, Film, Users } from "lucide-react";
import { getAdminCourses, getAdminUsers, getAdminSubscriptions } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/constants";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function AdminDashboardPage() {
  const [courses, users, subscriptions] = await Promise.all([
    getAdminCourses(),
    getAdminUsers(),
    getAdminSubscriptions(),
  ]);

  const students = users.filter((u) => u.role === "student");
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const revenue = activeSubs.reduce((acc, s) => acc + Number(s.plan?.price ?? 0), 0);
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules?.reduce((m, mod) => m + (mod.lessons?.length ?? 0), 0) ?? 0),
    0,
  );

  const metrics = [
    { label: "Alumnos", value: students.length, icon: Users },
    { label: "Cursos", value: courses.length, icon: BookOpen },
    { label: "Lecciones", value: totalLessons, icon: Film },
    { label: "Ingresos (activos)", value: formatMoney(revenue), icon: DollarSign },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-text">Dashboard</h1>
        <p className="mt-1 text-neutral-400">Resumen general de la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/15 text-accent-300">
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-2xl text-text tabular-nums">{m.value}</div>
                <div className="text-xs text-neutral-400">{m.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Alumnos recientes</CardTitle>
            <Link href="/admin/users" className="text-sm text-accent-300 hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {users.slice(0, 6).map((u) => (
                <li key={u.id} className="flex items-center gap-3 border-b border-divider/50 py-3 last:border-b-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(u.name || u.email || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-text">{u.name || "Sin nombre"}</div>
                    <div className="truncate text-xs text-neutral-500">{u.email}</div>
                  </div>
                  <Badge variant={u.role === "admin" ? "default" : "neutral"}>{u.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Suscripciones recientes</CardTitle>
            <Link href="/admin/subscriptions" className="text-sm text-accent-300 hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {subscriptions.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b border-divider/50 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-text">{s.profile?.name || s.profile?.email || "Alumno"}</div>
                    <div className="text-xs text-neutral-500">{s.plan?.name ?? "Sin plan"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-300">{s.plan ? formatMoney(Number(s.plan.price)) : "—"}</span>
                    <Badge variant="success">{SUBSCRIPTION_STATUS_LABELS[s.status] ?? s.status}</Badge>
                  </div>
                </li>
              ))}
              {subscriptions.length === 0 && (
                <li className="py-6 text-center text-sm text-neutral-500">Sin suscripciones todavía.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

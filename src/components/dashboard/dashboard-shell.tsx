"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Home,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo, { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Mis Cursos", icon: BookOpen },
  { href: "/dashboard/profile", label: "Mi Perfil", icon: User },
];

const COLLAPSE_KEY = "app-sidebar-collapsed";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardShell({
  user,
  children,
}: {
  user: { id: string; name: string | null; email: string | null; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Se lee después del montaje (no en el render) para evitar un
    // mismatch de hidratación: el servidor no conoce localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-divider bg-surface/40 sticky top-0 h-screen transition-[width] duration-200 ease-out",
          collapsed ? "w-19" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-divider h-18.25",
            collapsed ? "justify-center px-2" : "justify-between px-6",
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" title="7 Digital LLC">
            {collapsed ? <LogoMark height={26} /> : <Logo height={34} />}
          </Link>
          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              className="text-neutral-400 hover:text-accent-300 cursor-pointer flex-none"
              aria-label="Colapsar menú"
              title="Colapsar menú"
            >
              <PanelLeftClose className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            className="mx-auto mt-3 text-neutral-400 hover:text-accent-300 cursor-pointer"
            aria-label="Expandir menú"
            title="Expandir menú"
          >
            <PanelLeftOpen className="w-4.5 h-4.5" />
          </button>
        )}
        <nav className={cn("flex-1 py-5 flex flex-col gap-1", collapsed ? "px-2.5" : "px-3")}>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md py-2.5 text-sm transition-colors",
                  collapsed ? "justify-center px-2.5" : "px-3",
                  active
                    ? "bg-accent/15 text-accent-300"
                    : "text-neutral-300 hover:bg-surface hover:text-text",
                )}
              >
                <item.icon className="w-4.5 h-4.5 flex-none" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("py-4 border-t border-divider flex flex-col gap-1", collapsed ? "px-2.5" : "px-3")}>
          {user.role === "admin" && (
            <Link
              href="/admin"
              title={collapsed ? "Volver al panel admin" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md py-2.5 text-sm text-accent-300 hover:bg-accent/10 transition-colors",
                collapsed ? "justify-center px-2.5" : "px-3",
              )}
            >
              <ShieldCheck className="w-4.5 h-4.5 flex-none" />
              {!collapsed && "Volver al panel admin"}
            </Link>
          )}
          <Link
            href="/"
            title={collapsed ? "Ver sitio web" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md py-2.5 text-sm text-neutral-300 hover:bg-surface hover:text-text transition-colors",
              collapsed ? "justify-center px-2.5" : "px-3",
            )}
          >
            <Home className="w-4.5 h-4.5 flex-none" />
            {!collapsed && "Ver sitio web"}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              title={collapsed ? "Cerrar sesión" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md py-2.5 text-sm text-neutral-300 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer w-full",
                collapsed ? "justify-center px-2.5" : "px-3",
              )}
            >
              <LogOut className="w-4.5 h-4.5 flex-none" />
              {!collapsed && "Cerrar sesión"}
            </button>
          </form>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-divider flex flex-col">
            <div className="px-6 py-5 border-b border-divider flex items-center justify-between">
              <Logo height={34} />
              <button onClick={() => setMobileOpen(false)} className="text-neutral-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    pathname === item.href ? "bg-accent/15 text-accent-300" : "text-neutral-300",
                  )}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              ))}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-accent-300"
                >
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Volver al panel admin
                </Link>
              )}
              <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-300">
                <Home className="w-4.5 h-4.5" />
                Ver sitio web
              </Link>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-divider bg-bg/85 backdrop-blur-xl px-5 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-text cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-neutral-400 hidden sm:block">
              {user.role === "admin" ? "Panel de administración" : "Panel del alumno"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-text">{user.name || "Alumno"}</div>
              <div className="text-xs text-neutral-500">{user.email}</div>
            </div>
            <Avatar>
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 px-5 lg:px-8 py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

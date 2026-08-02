"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Ban, CheckCircle2, KeyRound, Loader2, Plus, Shield, Trash2, UserPlus } from "lucide-react";
import {
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  enrollUser,
  createUserByAdmin,
  type ActionState,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIER_LABELS } from "@/lib/constants";
import type { Course, Profile, Tier } from "@/lib/types";

const initialCreateState: ActionState = {};

export default function UsersManager({ users, courses }: { users: Profile[]; courses: Course[] }) {
  const [pending, startTransition] = useTransition();
  const [resetFor, setResetFor] = useState<Profile | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [enrollFor, setEnrollFor] = useState<Profile | null>(null);
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollTier, setEnrollTier] = useState<Tier>("basico");
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createState, createAction, creating] = useActionState(createUserByAdmin, initialCreateState);

  const show = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    // Reacciona al resultado de useActionState (sistema externo, la
    // Server Action): no hay forma de mostrar el toast/cerrar el modal
    // de forma síncrona durante el render.
    if (createState.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      show("success", createState.success);
      setCreateOpen(false);
    }
  }, [createState.success]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-text">Usuarios</h1>
          <p className="mt-1 text-neutral-400">
            Crea alumnos, gestiona roles, suspensiones, contraseñas e inscripciones. {users.length} usuarios.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {message && (
        <div
          className={
            message.type === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          }
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-divider">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-divider bg-surface/60">
            <tr>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Usuario</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Rol</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Estado</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text">Registro</th>
              <th className="px-5 py-3.5 font-heading font-semibold text-text text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-divider/50 last:border-b-0 hover:bg-surface/30">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-text">{u.name || "Sin nombre"}</div>
                  <div className="text-xs text-neutral-500">{u.email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.role === "admin" ? "default" : "neutral"}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-neutral-500">
                  {new Date(u.created_at).toLocaleDateString("es")}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Cambiar rol"
                      onClick={() =>
                        startTransition(() => {
                          updateUserRole(u.id, u.role === "admin" ? "student" : "admin").then((r) =>
                            r.error ? show("error", r.error) : show("success", r.success!),
                          );
                        })
                      }
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={u.status === "active" ? "Suspender" : "Activar"}
                      onClick={() =>
                        startTransition(() => {
                          updateUserStatus(u.id, u.status === "active" ? "suspended" : "active").then((r) =>
                            r.error ? show("error", r.error) : show("success", r.success!),
                          );
                        })
                      }
                    >
                      {u.status === "active" ? <Ban className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    </Button>
                    <Button variant="ghost" size="sm" title="Restablecer contraseña" onClick={() => setResetFor(u)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Inscribir en curso" onClick={() => setEnrollFor(u)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Eliminar"
                      className="text-red-300 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${u.email}? Esta acción no se puede deshacer.`)) {
                          startTransition(() => {
                            deleteUser(u.id).then((r) =>
                              r.error ? show("error", r.error) : show("success", r.success!),
                            );
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nuevo usuario */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea el acceso directamente: no necesita registrarse ni confirmar correo.
            </DialogDescription>
          </DialogHeader>
          <form action={createAction} className="flex flex-col gap-4">
            {createState.error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                {createState.error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-name">Nombre</Label>
              <Input id="new-name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-email">Correo</Label>
              <Input id="new-email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input id="new-password" name="password" type="password" required minLength={6} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role">Rol</Label>
              <Select id="new-role" name="role" defaultValue="student">
                <option value="student">Alumno</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? "Creando…" : "Crear usuario"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset de contraseña */}
      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para {resetFor?.email}. El usuario la podrá cambiar después.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(() => {
                resetUserPassword(resetFor!.id, resetPassword).then((r) => {
                  show(r.error ? "error" : "success", r.error ?? r.success!);
                  setResetFor(null);
                  setResetPassword("");
                });
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="np">Nueva contraseña</Label>
              <Input id="np" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Restablecer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inscribir en curso */}
      <Dialog open={!!enrollFor} onOpenChange={(o) => !o && setEnrollFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribir alumno</DialogTitle>
            <DialogDescription>
              Asigna un curso a {enrollFor?.name || enrollFor?.email}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!enrollCourse) return;
              startTransition(() => {
                enrollUser(enrollFor!.id, enrollCourse, enrollTier).then((r) => {
                  show(r.error ? "error" : "success", r.error ?? r.success!);
                  setEnrollFor(null);
                  setEnrollCourse("");
                  setEnrollTier("basico");
                });
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="course">Curso</Label>
              <Select id="course" value={enrollCourse} onChange={(e) => setEnrollCourse(e.target.value)}>
                <option value="">Selecciona un curso…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tier">Nivel</Label>
              <Select id="tier" value={enrollTier} onChange={(e) => setEnrollTier(e.target.value as Tier)}>
                {(Object.keys(TIER_LABELS) as Tier[]).map((t) => (
                  <option key={t} value={t}>
                    {TIER_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={pending || !enrollCourse}>
              {pending ? "Inscribiendo…" : "Inscribir"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

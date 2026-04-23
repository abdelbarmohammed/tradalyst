"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle, X } from "lucide-react";
import { get, patch, del } from "@/lib/api";
import { formatDateMedium } from "@/lib/format";

interface AdminUser {
  id: number;
  email: string;
  display_name: string;
  bio: string;
  role: "trader" | "mentor" | "admin";
  is_active: boolean;
  date_joined: string;
}

type ConfirmAction = "suspend" | "activate" | "delete" | null;

const ACTION_LABELS: Record<NonNullable<ConfirmAction>, { title: string; body: string; confirm: string; danger: boolean }> = {
  suspend: {
    title: "Suspender cuenta",
    body: "El usuario perderá acceso inmediatamente. Podrás reactivarla más tarde.",
    confirm: "Suspender",
    danger: true,
  },
  activate: {
    title: "Reactivar cuenta",
    body: "El usuario recuperará acceso a la plataforma.",
    confirm: "Reactivar",
    danger: false,
  },
  delete: {
    title: "Eliminar cuenta",
    body: "Esta acción es permanente. Todos los datos del usuario serán eliminados y no se pueden recuperar.",
    confirm: "Eliminar permanentemente",
    danger: true,
  },
};

function ConfirmModal({
  action, onConfirm, onCancel, loading,
}: { action: NonNullable<ConfirmAction>; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const cfg = ACTION_LABELS[action];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted hover:text-primary">
          <X size={14} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">Confirmar acción</p>
        <p className="font-sans text-[14px] font-semibold text-primary mb-2">{cfg.title}</p>
        <p className="font-sans text-[13px] text-secondary mb-6">{cfg.body}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 font-sans text-[13px] font-semibold px-4 py-[9px] transition-colors disabled:opacity-50 ${
              cfg.danger ? "bg-loss/80 hover:bg-loss text-white" : "bg-green hover:bg-green-hover text-white"
            }`}>
            {loading ? "Procesando…" : cfg.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[3px] py-3 border-b border-white/[0.05] last:border-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="font-sans text-[13px] text-primary">{children}</div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    get<AdminUser>(`/api/users/${id}/`)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar el usuario."))
      .finally(() => setLoading(false));
  }, [id]);

  async function executeAction() {
    if (!confirmAction || !user) return;
    setActionLoading(true);
    try {
      if (confirmAction === "delete") {
        await del(`/api/users/${id}/`);
        window.location.href = "/admin/users";
        return;
      }
      const updated = await patch<AdminUser>(`/api/users/${id}/`, {
        is_active: confirmAction === "activate",
      });
      setUser(updated);
      setSuccessMsg(confirmAction === "activate" ? "Cuenta reactivada." : "Cuenta suspendida.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ejecutar la acción.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[700px] mx-auto space-y-5">
        <div className="skeleton h-4 w-20 rounded-sm" />
        <div className="skeleton h-6 w-48 rounded-sm" />
        <div className="card p-5 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-[700px] mx-auto">
        <p className="font-sans text-[14px] text-loss">{error}</p>
        <Link href="/admin/users" className="font-mono text-[11px] text-green hover:underline mt-3 inline-block">
          ← Volver a usuarios
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
          loading={actionLoading}
        />
      )}

      <div className="max-w-[700px] mx-auto space-y-5">
        <div>
          <Link href="/admin/users" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
            <ChevronLeft size={12} />
            Usuarios
          </Link>
          <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
            {user.display_name || user.email}
          </h1>
          <p className="font-mono text-[11px] text-muted mt-[3px]">{user.email}</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
            <AlertCircle size={15} className="text-loss flex-shrink-0" />
            <p className="font-sans text-[13px] text-loss">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-4 border border-profit/30 bg-profit/[0.06] rounded-sm">
            <p className="font-sans text-[13px] text-profit">{successMsg}</p>
          </div>
        )}

        {/* ── Profile ── */}
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">Perfil</p>
          <Field label="ID">{user.id}</Field>
          <Field label="Email">{user.email}</Field>
          <Field label="Nombre">{user.display_name || <span className="text-muted">—</span>}</Field>
          <Field label="Bio">{user.bio || <span className="text-muted">—</span>}</Field>
          <Field label="Rol">
            <span className={`font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-[3px] ${
              user.role === "trader" ? "text-secondary border border-white/[0.1]"
              : user.role === "mentor" ? "text-green/80 border border-green/20"
              : "text-primary border border-white/[0.2]"
            }`}>
              {user.role}
            </span>
          </Field>
          <Field label="Estado">
            <span className={`font-mono text-[11px] ${user.is_active ? "text-profit" : "text-loss"}`}>
              {user.is_active ? "Activo" : "Suspendido"}
            </span>
          </Field>
          <Field label="Registrado">{formatDateMedium(user.date_joined)}</Field>
        </div>

        {/* ── Actions ── */}
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-4">Acciones</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {user.is_active ? (
              <button
                onClick={() => setConfirmAction("suspend")}
                className="font-sans text-[13px] font-semibold px-4 py-[9px] border border-loss/30 text-loss hover:bg-loss/[0.08] transition-colors"
              >
                Suspender cuenta
              </button>
            ) : (
              <button
                onClick={() => setConfirmAction("activate")}
                className="font-sans text-[13px] font-semibold px-4 py-[9px] bg-green hover:bg-green-hover text-white transition-colors"
              >
                Reactivar cuenta
              </button>
            )}
            <button
              onClick={() => setConfirmAction("delete")}
              className="font-sans text-[13px] px-4 py-[9px] border border-white/[0.1] text-muted hover:text-loss hover:border-loss/30 transition-colors"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, Check, Download, Trash2, X, UserCheck, Clock, BookOpen } from "lucide-react";
import { get, patch, post, del } from "@/lib/api";
import { MARKETING_URL } from "@/lib/urls";
import { logout } from "@/lib/auth";
import { formatDateMedium } from "@/lib/format";
import type { UserProfile, Trade, PaginatedTrades, MentorRequest, MentorAssignment } from "@/types";

// ── Shared field components ───────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
      {error && <p className="font-mono text-[10px] text-loss mt-[2px]">{error}</p>}
    </div>
  );
}

const inputCls =
  "bg-base border border-white/[0.10] px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full";

const inputDisabledCls =
  "bg-base border border-white/[0.06] px-3 py-[9px] font-mono text-[12px] text-muted w-full cursor-not-allowed";

function SaveBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 border border-green/25 bg-green/[0.06]">
      <Check size={13} className="text-green flex-shrink-0" />
      <p className="font-sans text-[12px] text-green">{message}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 border border-loss/30 bg-loss/[0.06]">
      <AlertCircle size={13} className="text-loss flex-shrink-0" />
      <p className="font-sans text-[12px] text-loss">{message}</p>
    </div>
  );
}

// ── Tab: Perfil ───────────────────────────────────────────────────────────────

function PerfilTab({ user, onUpdated }: { user: UserProfile; onUpdated: (u: UserProfile) => void }) {
  const [name, setName] = useState(user.display_name);
  const [bio, setBio]   = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const updated = await patch<UserProfile>("/api/users/me/", { display_name: name.trim(), bio: bio.trim() });
      onUpdated(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      {success && <SaveBanner message="Cambios guardados correctamente." />}
      {error && <ErrorBanner message={error} />}

      <Field label="Nombre">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>

      <Field label="Email">
        <input type="email" value={user.email} disabled className={inputDisabledCls} />
        <p className="font-mono text-[9px] text-muted">El email no se puede cambiar.</p>
      </Field>

      <Field label="Bio (opcional)">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="bg-base border border-white/[0.10] px-3 py-[9px] font-sans text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none"
          placeholder="Cuéntanos algo sobre ti…"
        />
      </Field>

      <button type="submit" disabled={saving} className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[9px] transition-colors disabled:opacity-50">
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

// ── Tab: Seguridad ────────────────────────────────────────────────────────────

function SeguridadTab() {
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPwd !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (newPwd.length < 8)  { setError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    setSaving(true);
    setSuccess(false);
    try {
      await post("/api/auth/change-password/", { current_password: current, new_password: newPwd });
      setSuccess(true);
      setCurrent(""); setNewPwd(""); setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && <SaveBanner message="Contraseña actualizada correctamente." />}
      {error && <ErrorBanner message={error} />}
      <Field label="Contraseña actual">
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} autoComplete="current-password" />
      </Field>
      <Field label="Nueva contraseña">
        <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} autoComplete="new-password" />
      </Field>
      <Field label="Confirmar nueva contraseña">
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} autoComplete="new-password" />
      </Field>
      <button type="submit" disabled={saving || !current || !newPwd || !confirm} className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[9px] transition-colors disabled:opacity-50">
        {saving ? "Actualizando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}

// ── Tab: Mentor (trader view) ─────────────────────────────────────────────────

function MentorTab() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [assignment, setAssignment] = useState<MentorAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      get<{ count: number; results: MentorRequest[] }>("/api/mentors/requests/received/"),
      get<MentorAssignment>("/api/mentors/my-mentor/").catch(() => null),
    ])
      .then(([reqs, asgn]) => {
        setRequests(reqs.results);
        setAssignment(asgn);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar datos."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(requestId: number) {
    setActionError(null);
    try {
      const asgn = await post<MentorAssignment>(`/api/mentors/requests/${requestId}/accept/`, {});
      setAssignment(asgn);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al aceptar.");
    }
  }

  async function handleReject(requestId: number) {
    setActionError(null);
    try {
      await post(`/api/mentors/requests/${requestId}/reject/`, {});
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al rechazar.");
    }
  }

  async function handleRevoke() {
    if (!assignment) return;
    setActionError(null);
    try {
      await del(`/api/mentors/assignments/${assignment.id}/`);
      setAssignment(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al revocar acceso.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-md">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-sm" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-md">
      {error && <ErrorBanner message={error} />}
      {actionError && <ErrorBanner message={actionError} />}

      {/* Incoming pending requests */}
      {requests.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Solicitudes recibidas</p>
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
              <div className="min-w-0">
                <p className="font-sans text-[13px] text-primary truncate">
                  {req.mentor_detail.display_name || req.mentor_detail.email}
                </p>
                <p className="font-mono text-[10px] text-muted">{req.mentor_detail.email}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="flex items-center gap-1 font-mono text-[10px] bg-green hover:bg-green-hover text-white px-3 py-[6px] transition-colors"
                >
                  <UserCheck size={11} />
                  Aceptar
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex items-center gap-1 font-mono text-[10px] border border-white/[0.10] text-muted hover:text-primary px-3 py-[6px] transition-colors"
                >
                  <X size={11} />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current mentor */}
      <div className="card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">Mentor asignado</p>
        {assignment ? (
          <div className="space-y-3">
            <div>
              <p className="font-sans text-[14px] font-semibold text-primary">
                {assignment.mentor_detail.display_name || assignment.mentor_detail.email}
              </p>
              <p className="font-mono text-[10px] text-muted mt-[2px]">
                {assignment.mentor_detail.email} · Desde {formatDateMedium(assignment.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/mentor-trades"
                className="flex items-center gap-2 font-mono text-[11px] border border-white/[0.10] text-secondary hover:text-primary px-3 py-[7px] transition-colors"
              >
                <BookOpen size={12} />
                Ver operaciones de mi mentor
              </Link>
            </div>
            <button
              onClick={handleRevoke}
              className="font-mono text-[10px] text-muted hover:text-loss transition-colors underline"
            >
              Revocar acceso
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="space-y-2">
            <p className="font-sans text-[13px] text-secondary">No tienes ningún mentor asignado.</p>
            <p className="font-mono text-[11px] text-muted">
              Comparte tu email con un mentor para que te envíe una solicitud de seguimiento.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-muted" />
            <p className="font-sans text-[13px] text-secondary">Tienes solicitudes pendientes de revisar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Mis alumnos (mentor view) ────────────────────────────────────────────

function MisAlumnosTab() {
  return (
    <div className="max-w-md">
      <p className="font-sans text-[13px] text-secondary">
        Gestiona tus alumnos desde la sección{" "}
        <Link href="/mentor" className="text-green hover:underline">Mis alumnos</Link>.
      </p>
    </div>
  );
}

// ── Tab: Plan ─────────────────────────────────────────────────────────────────

function PlanTab({ user }: { user: UserProfile }) {
  const isPro = user.plan === "pro";
  return (
    <div className="space-y-4 max-w-md">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Plan actual</p>
          <span className={`font-mono text-[10px] px-3 py-[3px] border ${isPro ? "border-green/40 text-green bg-green/10" : "border-white/[0.12] text-secondary"}`}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>
        {isPro ? (
          <>
            <p className="font-sans text-[13px] text-secondary mb-4">Tienes acceso completo a todas las funciones de Tradalyst.</p>
            <button className="font-mono text-[11px] text-muted hover:text-loss transition-colors underline">Cancelar suscripción</button>
          </>
        ) : (
          <>
            <p className="font-sans text-[13px] text-secondary mb-4">Actualiza a Pro para desbloquear análisis de IA ilimitados, acceso a mentor y exportación avanzada.</p>
            <a href={`${MARKETING_URL}/precios`} className="inline-block font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-5 py-[9px] transition-colors">
              Ver planes →
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ── Tab: Cuenta ───────────────────────────────────────────────────────────────

function CuentaTab() {
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await get<PaginatedTrades>("/api/trades/?page_size=10000&ordering=entry_time");
      const trades = res.results;
      const header = ["id","pair","direction","entry_price","exit_price","quantity","pnl","result","emotion","entry_time","exit_time","notes"].join(",");
      const rows = trades.map((t: Trade) =>
        [t.id,t.pair,t.direction,t.entry_price,t.exit_price??"",t.quantity,t.pnl??"",t.result??"",t.emotion??"",t.entry_time,t.exit_time??"",`"${(t.notes??"").replace(/"/g,'""')}"`].join(",")
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tradalyst_operaciones_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "ELIMINAR") return;
    setDeleting(true);
    try {
      await logout();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-muted hover:text-primary">
              <X size={14} />
            </button>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-loss mb-3">Eliminar cuenta</p>
            <p className="font-sans text-[13px] text-primary mb-2">Esta acción es permanente e irreversible.</p>
            <p className="font-sans text-[12px] text-muted mb-4">
              Se eliminarán todos tus datos. Escribe <strong className="text-primary">ELIMINAR</strong> para confirmar.
            </p>
            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="ELIMINAR" className={`${inputCls} mb-4`} />
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 font-sans text-[13px] border border-white/[0.12] text-secondary py-[9px] hover:text-primary transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={deleteConfirm !== "ELIMINAR" || deleting} className="flex-1 font-sans text-[13px] font-semibold bg-loss/80 hover:bg-loss text-white py-[9px] transition-colors disabled:opacity-40">
                {deleting ? "Eliminando…" : "Eliminar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4 max-w-md">
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-2">Exportar datos</p>
          <p className="font-sans text-[12px] text-muted mb-4">Descarga todas tus operaciones en formato CSV (derecho de portabilidad RGPD).</p>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 font-sans text-[13px] font-semibold border border-white/[0.12] text-secondary hover:text-primary px-5 py-[9px] transition-colors disabled:opacity-50">
            <Download size={13} />
            {exporting ? "Exportando…" : "Exportar operaciones CSV"}
          </button>
        </div>
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-loss mb-2">Zona de peligro</p>
          <p className="font-sans text-[12px] text-muted mb-4">Eliminar tu cuenta borrará permanentemente todos tus datos.</p>
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 font-sans text-[13px] font-semibold border border-loss/30 text-loss hover:bg-loss/[0.08] px-5 py-[9px] transition-colors">
            <Trash2 size={13} />
            Eliminar cuenta
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("perfil");

  const fetchUser = useCallback(async () => {
    try {
      const u = await get<UserProfile>("/api/users/me/");
      setUser(u);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const isMentor = user?.role === "mentor";

  const TABS = isMentor
    ? [
        { value: "perfil",     label: "Perfil" },
        { value: "seguridad",  label: "Seguridad" },
        { value: "alumnos",    label: "Mis alumnos" },
        { value: "cuenta",     label: "Cuenta" },
      ]
    : [
        { value: "perfil",    label: "Perfil" },
        { value: "seguridad", label: "Seguridad" },
        { value: "mentor",    label: "Mentor" },
        { value: "plan",      label: "Plan" },
        { value: "cuenta",    label: "Cuenta" },
      ];

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">Ajustes</h1>

      <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit overflow-hidden">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`font-mono text-[11px] px-4 py-[8px] transition-colors ${tab === value ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full max-w-md rounded-sm" />)}
          </div>
        ) : (
          <>
            {tab === "perfil"    && user && <PerfilTab user={user} onUpdated={setUser} />}
            {tab === "seguridad" && <SeguridadTab />}
            {tab === "mentor"    && !isMentor && <MentorTab />}
            {tab === "alumnos"   && isMentor && <MisAlumnosTab />}
            {tab === "plan"      && !isMentor && user && <PlanTab user={user} />}
            {tab === "cuenta"    && <CuentaTab />}
          </>
        )}
      </div>
    </div>
  );
}

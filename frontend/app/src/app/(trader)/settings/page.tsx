"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Download, Trash2, X, UserCheck, Clock, BookOpen, Sun, Moon, LogOut, Sparkles, ExternalLink } from "lucide-react";
import { get, patch, post, del } from "@/lib/api";
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
  const router = useRouter();
  const t = useTranslations("settings.profile");

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    router.refresh();
  }

  function switchTheme(theme: "light" | "dark") {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.cookie = `THEME=${theme};path=/;max-age=31536000`;
    patch("/api/users/me/", { theme_preference: theme }).catch(() => {});
  }

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
      setError(err instanceof Error ? err.message : t("errorSave"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      {success && <SaveBanner message={t("saved")} />}
      {error && <ErrorBanner message={error} />}

      <Field label={t("name")}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>

      <Field label={t("email")}>
        <input type="email" value={user.email} disabled className={inputDisabledCls} />
        <p className="font-mono text-[9px] text-muted">{t("emailNote")}</p>
      </Field>

      <Field label={t("bio")}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="bg-base border border-white/[0.10] px-3 py-[9px] font-sans text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none"
          placeholder={t("bioPlaceholder")}
        />
      </Field>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t("language")}</label>
        <div className="flex gap-[2px] w-fit">
          {(["es", "en"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              className="font-mono text-[11px] px-4 py-[7px] border border-white/[0.10] text-secondary hover:text-primary transition-colors"
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t("theme") || "Tema"}</label>
        <div className="flex gap-[2px] w-fit">
          <button
            type="button"
            onClick={() => switchTheme("light")}
            className="flex items-center gap-2 font-mono text-[11px] px-4 py-[7px] border border-white/[0.10] text-secondary hover:text-primary transition-colors"
          >
            <Sun size={11} />
            {t("themeLight") || "Claro"}
          </button>
          <button
            type="button"
            onClick={() => switchTheme("dark")}
            className="flex items-center gap-2 font-mono text-[11px] px-4 py-[7px] border border-white/[0.10] text-secondary hover:text-primary transition-colors"
          >
            <Moon size={11} />
            {t("themeDark") || "Oscuro"}
          </button>
        </div>
      </div>

      <button type="submit" disabled={saving} className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[9px] transition-colors disabled:opacity-50">
        {saving ? t("saving") : t("save")}
      </button>

      {/* Logout — only shown on mobile where sidebar is hidden */}
      <div className="lg:hidden pt-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 w-full font-sans text-[13px] border border-loss/30 text-loss hover:bg-loss/[0.06] px-5 py-[11px] transition-colors"
        >
          <LogOut size={14} />
          {t("logout") || "Cerrar sesión"}
        </button>
      </div>
    </form>
  );
}

// ── Tab: Seguridad ────────────────────────────────────────────────────────────

function SeguridadTab() {
  const t = useTranslations("settings.security");
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPwd !== confirm) { setError(t("errorMatch")); return; }
    if (newPwd.length < 8)  { setError(t("errorLength")); return; }
    setSaving(true);
    setSuccess(false);
    try {
      await post("/api/auth/change-password/", { current_password: current, new_password: newPwd });
      setSuccess(true);
      setCurrent(""); setNewPwd(""); setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUpdate"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && <SaveBanner message={t("updated")} />}
      {error && <ErrorBanner message={error} />}
      <Field label={t("currentPassword")}>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} autoComplete="current-password" />
      </Field>
      <Field label={t("newPassword")}>
        <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} autoComplete="new-password" />
      </Field>
      <Field label={t("confirmPassword")}>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} autoComplete="new-password" />
      </Field>
      <button type="submit" disabled={saving || !current || !newPwd || !confirm} className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[9px] transition-colors disabled:opacity-50">
        {saving ? t("updating") : t("update")}
      </button>
    </form>
  );
}

// ── Tab: Mentor (trader view) ─────────────────────────────────────────────────

function MentorTab() {
  const t = useTranslations("settings.mentor");
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
      .catch((err) => setError(err instanceof Error ? err.message : t("errorLoad")))
      .finally(() => setLoading(false));
  }, [t]);

  async function handleAccept(requestId: number) {
    setActionError(null);
    try {
      const asgn = await post<MentorAssignment>(`/api/mentors/requests/${requestId}/accept/`, {});
      setAssignment(asgn);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("errorAccept"));
    }
  }

  async function handleReject(requestId: number) {
    setActionError(null);
    try {
      await post(`/api/mentors/requests/${requestId}/reject/`, {});
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("errorReject"));
    }
  }

  async function handleRevoke() {
    if (!assignment) return;
    setActionError(null);
    try {
      await del(`/api/mentors/assignments/${assignment.id}/`);
      setAssignment(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("errorRevoke"));
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

      {requests.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t("receivedRequests")}</p>
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
                  {t("accept")}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex items-center gap-1 font-mono text-[10px] border border-white/[0.10] text-muted hover:text-primary px-3 py-[6px] transition-colors"
                >
                  <X size={11} />
                  {t("reject")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">{t("assignedMentor")}</p>
        {assignment ? (
          <div className="space-y-3">
            <div>
              <p className="font-sans text-[14px] font-semibold text-primary">
                {assignment.mentor_detail.display_name || assignment.mentor_detail.email}
              </p>
              <p className="font-mono text-[10px] text-muted mt-[2px]">
                {assignment.mentor_detail.email} · {t("since")} {formatDateMedium(assignment.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/mentor-trades"
                className="flex items-center gap-2 font-mono text-[11px] border border-white/[0.10] text-secondary hover:text-primary px-3 py-[7px] transition-colors"
              >
                <BookOpen size={12} />
                {t("viewTrades")}
              </Link>
            </div>
            <button
              onClick={handleRevoke}
              className="font-mono text-[10px] text-muted hover:text-loss transition-colors underline"
            >
              {t("revoke")}
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="space-y-2">
            <p className="font-sans text-[13px] text-secondary">{t("noMentor")}</p>
            <p className="font-mono text-[11px] text-muted">{t("noMentorHint")}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-muted" />
            <p className="font-sans text-[13px] text-secondary">{t("pendingToReview")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Mis alumnos (mentor view) ────────────────────────────────────────────

function MisAlumnosTab() {
  const t = useTranslations("settings.students");
  const tNav = useTranslations("nav");
  return (
    <div className="max-w-md">
      <p className="font-sans text-[13px] text-secondary">
        {t("text")}{" "}
        <Link href="/mentor" className="text-green hover:underline">{tNav("myStudents")}</Link>.
      </p>
    </div>
  );
}

// ── Tab: Plan ─────────────────────────────────────────────────────────────────

function PlanTab({ user, onRefresh }: { user: UserProfile; onRefresh: () => void }) {
  const t = useTranslations("settings.plan");
  const isPro = user.plan === "pro";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgradeStatus = searchParams.get("upgrade");

  const FEATURES_PRO = [t("featPro0"), t("featPro1"), t("featPro2"), t("featPro3"), t("featPro4")];
  const FEATURES_FREE = [t("featFree0"), t("featFree1"), t("featFree2"), t("featFree3")];

  useEffect(() => {
    if (upgradeStatus === "success") {
      onRefresh();
      router.replace("/settings?tab=plan");
    }
  }, [upgradeStatus, onRefresh, router]);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    setError(null);
    try {
      const data = await post<{ url: string }>("/api/billing/create-checkout-session/", {});
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUpgrade"));
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError(null);
    try {
      const data = await get<{ url: string }>("/api/billing/portal/");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorPortal"));
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      {upgradeStatus === "success" && (
        <SaveBanner message={t("welcomePro")} />
      )}
      {upgradeStatus === "cancelled" && (
        <div className="flex items-center gap-2 p-3 border border-white/[0.10] bg-surface/50">
          <p className="font-sans text-[12px] text-secondary">{t("paymentCancelled")}</p>
        </div>
      )}
      {error && <ErrorBanner message={error} />}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t("currentPlan")}</p>
          <span className={`font-mono text-[10px] px-3 py-[3px] border ${isPro ? "border-green/40 text-green bg-green/10" : "border-white/[0.12] text-secondary"}`}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <p className="font-sans text-[13px] text-secondary">{t("hasAccess")}</p>
            <ul className="space-y-[6px]">
              {FEATURES_PRO.map((feat) => (
                <li key={feat} className="flex items-center gap-2 font-sans text-[12px] text-secondary">
                  <Check size={11} className="text-green flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 font-mono text-[11px] text-muted hover:text-secondary transition-colors underline disabled:opacity-50"
            >
              <ExternalLink size={11} />
              {portalLoading ? t("openingPortal") : t("manageSubscription")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-sans text-[13px] text-secondary">{t("upgradePrompt")}</p>
            <ul className="space-y-[6px]">
              {FEATURES_FREE.map((feat) => (
                <li key={feat} className="flex items-center gap-2 font-sans text-[12px] text-secondary">
                  <Sparkles size={11} className="text-green flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="flex items-center gap-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-5 py-[9px] transition-colors disabled:opacity-50"
              >
                {checkoutLoading ? t("redirecting") : t("trial")}
              </button>
              <p className="font-mono text-[9px] text-muted">{t("noCard")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Cuenta ───────────────────────────────────────────────────────────────

function CuentaTab() {
  const t = useTranslations("settings.data");
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
      const rows = trades.map((tr: Trade) =>
        [tr.id,tr.pair,tr.direction,tr.entry_price,tr.exit_price??"",tr.quantity,tr.pnl??"",tr.result??"",tr.emotion??"",tr.entry_time,tr.exit_time??"",`"${(tr.notes??"").replace(/"/g,'""')}"`].join(",")
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tradalyst_trades_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== t("deleteWord")) return;
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
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-loss mb-3">{t("deleteModalTitle")}</p>
            <p className="font-sans text-[13px] text-primary mb-2">{t("deleteModalBody")}</p>
            <p className="font-sans text-[12px] text-muted mb-4">
              {t("deleteModalBody")}{" "}
              <strong className="text-primary">{t("deleteWord")}</strong>
            </p>
            <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={t("deleteWord")} className={`${inputCls} mb-4`} />
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 font-sans text-[13px] border border-white/[0.12] text-secondary py-[9px] hover:text-primary transition-colors">{t("cancel")}</button>
              <button onClick={handleDelete} disabled={deleteConfirm !== t("deleteWord") || deleting} className="flex-1 font-sans text-[13px] font-semibold bg-loss/80 hover:bg-loss text-white py-[9px] transition-colors disabled:opacity-40">
                {deleting ? t("deleting") : t("deleteButton")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-md">
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-2">{t("exportTitle")}</p>
          <p className="font-sans text-[12px] text-muted mb-4">{t("exportNote")}</p>
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 font-sans text-[13px] font-semibold border border-white/[0.12] text-secondary hover:text-primary px-5 py-[9px] transition-colors disabled:opacity-50">
            <Download size={13} />
            {exporting ? t("exporting") : t("exportButton")}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-12 mb-6">
          <hr className="flex-1" style={{ borderColor: "rgba(217,64,64,0.25)" }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-loss shrink-0">{t("dangerZone")}</span>
          <hr className="flex-1" style={{ borderColor: "rgba(217,64,64,0.25)" }} />
        </div>

        <div className="card p-5">
          <p className="font-sans text-[13px] text-primary mb-1">{t("deleteTitle")}</p>
          <p className="font-sans text-[12px] text-muted mb-4">{t("deleteNote")}</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 font-sans text-[13px] font-semibold border border-loss text-loss hover:bg-loss hover:text-white px-5 py-[9px] transition-colors"
          >
            <Trash2 size={13} />
            {t("deleteButton")}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Tab: Plataforma (admin only) ──────────────────────────────────────────────

function PlataformaTab() {
  const t = useTranslations("settings.platform");
  return (
    <div className="max-w-md space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t("title")}</p>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 font-mono text-[11px] border border-white/[0.10] text-secondary hover:text-primary px-4 py-[9px] transition-colors"
      >
        {t("link")}
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "perfil");
  const t = useTranslations("settings");

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
  const isAdmin  = user?.role === "admin";
  const tNav = useTranslations("nav");

  const TABS = isAdmin
    ? [
        { value: "perfil",      label: t("tabProfile") },
        { value: "seguridad",   label: t("tabSecurity") },
        { value: "plataforma",  label: t("tabPlatform") },
        { value: "cuenta",      label: t("tabData") },
      ]
    : isMentor
    ? [
        { value: "perfil",     label: t("tabProfile") },
        { value: "seguridad",  label: t("tabSecurity") },
        { value: "alumnos",    label: tNav("myStudents") },
        { value: "cuenta",     label: t("tabData") },
      ]
    : [
        { value: "perfil",    label: t("tabProfile") },
        { value: "seguridad", label: t("tabSecurity") },
        { value: "mentor",    label: t("tabMentor") },
        { value: "plan",      label: t("tabPlan") },
        { value: "cuenta",    label: t("tabData") },
      ];

  return (
    <div className="max-w-[800px] mx-auto px-4 lg:px-0 pb-28 lg:pb-6 space-y-6">
      <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{t("title")}</h1>

      {/* Tabs — scrollable on mobile to prevent overflow */}
      <div className="overflow-x-auto -mx-4 lg:mx-0 px-4 lg:px-0">
        <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-max lg:w-fit overflow-hidden">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`font-mono text-[11px] px-4 py-[8px] whitespace-nowrap transition-colors ${tab === value ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full max-w-md rounded-sm" />)}
          </div>
        ) : (
          <>
            {tab === "perfil"      && user && <PerfilTab user={user} onUpdated={setUser} />}
            {tab === "seguridad"   && <SeguridadTab />}
            {tab === "mentor"      && !isMentor && !isAdmin && <MentorTab />}
            {tab === "alumnos"     && isMentor && <MisAlumnosTab />}
            {tab === "plan"        && !isMentor && !isAdmin && user && <PlanTab user={user} onRefresh={fetchUser} />}
            {tab === "plataforma"  && isAdmin && <PlataformaTab />}
            {tab === "cuenta"      && <CuentaTab />}
          </>
        )}
      </div>
    </div>
  );
}

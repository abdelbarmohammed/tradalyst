"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

interface ActionCfg { title: string; body: string; confirm: string; danger: boolean }

function ConfirmModal({
  cfg, onConfirm, onCancel, loading, confirmActionLabel, cancelLabel, processingLabel,
}: { cfg: ActionCfg; onConfirm: () => void; onCancel: () => void; loading: boolean; confirmActionLabel: string; cancelLabel: string; processingLabel: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted hover:text-primary">
          <X size={14} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">{confirmActionLabel}</p>
        <p className="font-sans text-[14px] font-semibold text-primary mb-2">{cfg.title}</p>
        <p className="font-sans text-[13px] text-secondary mb-6">{cfg.body}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors disabled:opacity-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 font-sans text-[13px] font-semibold px-4 py-[9px] transition-colors disabled:opacity-50 ${
              cfg.danger ? "bg-loss/80 hover:bg-loss text-white" : "bg-green hover:bg-green-hover text-white"
            }`}>
            {loading ? processingLabel : cfg.confirm}
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
  const t = useTranslations("adminUserDetail");

  const ACTION_LABELS: Record<NonNullable<ConfirmAction>, ActionCfg> = {
    suspend: {
      title: t("suspendTitle"),
      body: t("suspendBody"),
      confirm: t("suspendConfirm"),
      danger: true,
    },
    activate: {
      title: t("activateTitle"),
      body: t("activateBody"),
      confirm: t("activateConfirm"),
      danger: false,
    },
    delete: {
      title: t("deleteTitle"),
      body: t("deleteBody"),
      confirm: t("deleteConfirm"),
      danger: true,
    },
  };

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    get<AdminUser>(`/api/users/${id}/`)
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : t("errorLoad")))
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
      setSuccessMsg(confirmAction === "activate" ? t("successActivated") : t("successSuspended"));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorAction"));
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
          {t("backToUsers")}
        </Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {confirmAction && (
        <ConfirmModal
          cfg={ACTION_LABELS[confirmAction]}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
          loading={actionLoading}
          confirmActionLabel={t("confirmAction")}
          cancelLabel={t("cancelAction")}
          processingLabel={t("processing")}
        />
      )}

      <div className="max-w-[700px] mx-auto space-y-5">
        <div>
          <Link href="/admin/users" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
            <ChevronLeft size={12} />
            {t("backLink")}
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
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">{t("sectionProfile")}</p>
          <Field label={t("fieldId")}>{user.id}</Field>
          <Field label={t("fieldEmail")}>{user.email}</Field>
          <Field label={t("fieldName")}>{user.display_name || <span className="text-muted">—</span>}</Field>
          <Field label={t("fieldBio")}>{user.bio || <span className="text-muted">—</span>}</Field>
          <Field label={t("fieldRole")}>
            <span className={`font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-[3px] ${
              user.role === "trader" ? "text-secondary border border-white/[0.1]"
              : user.role === "mentor" ? "text-green/80 border border-green/20"
              : "text-primary border border-white/[0.2]"
            }`}>
              {user.role}
            </span>
          </Field>
          <Field label={t("fieldStatus")}>
            <span className={`font-mono text-[11px] ${user.is_active ? "text-profit" : "text-loss"}`}>
              {user.is_active ? t("statusActive") : t("statusSuspended")}
            </span>
          </Field>
          <Field label={t("fieldJoined")}>{formatDateMedium(user.date_joined)}</Field>
        </div>

        {/* ── Actions ── */}
        <div className="card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-4">{t("sectionActions")}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {user.is_active ? (
              <button
                onClick={() => setConfirmAction("suspend")}
                className="font-sans text-[13px] font-semibold px-4 py-[9px] border border-loss/30 text-loss hover:bg-loss/[0.08] transition-colors"
              >
                {t("suspend")}
              </button>
            ) : (
              <button
                onClick={() => setConfirmAction("activate")}
                className="font-sans text-[13px] font-semibold px-4 py-[9px] bg-green hover:bg-green-hover text-white transition-colors"
              >
                {t("activate")}
              </button>
            )}
            <button
              onClick={() => setConfirmAction("delete")}
              className="font-sans text-[13px] px-4 py-[9px] border border-white/[0.1] text-muted hover:text-loss hover:border-loss/30 transition-colors"
            >
              {t("delete")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

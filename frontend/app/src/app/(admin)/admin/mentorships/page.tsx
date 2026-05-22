"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, AlertCircle, X } from "lucide-react";
import { get, del } from "@/lib/api";
import type { AdminMentorshipsData } from "@/types";

type Tab = "active" | "pending";

function DissolveModal({
  assignmentId,
  onConfirm,
  onCancel,
  loading,
}: {
  assignmentId: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const t = useTranslations("adminMentorships");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-elevated border border-white/[0.08] w-full max-w-[420px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="font-sans text-[15px] font-semibold text-primary">{t("dissolveTitle")}</p>
          <button onClick={onCancel} className="text-muted hover:text-primary transition-colors mt-[2px]">
            <X size={15} />
          </button>
        </div>
        <p className="font-sans text-[13px] text-secondary mb-6">{t("dissolveBody")}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="font-mono text-[11px] text-muted border border-white/[0.08] px-4 py-2 hover:text-primary hover:border-white/20 transition-colors disabled:opacity-40"
          >
            {t("dissolveCancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="font-mono text-[11px] text-loss border border-loss/30 px-4 py-2 hover:bg-loss/[0.08] transition-colors disabled:opacity-40"
          >
            {loading ? "…" : t("dissolveConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMentorshipsPage() {
  const t = useTranslations("adminMentorships");

  const [data, setData] = useState<AdminMentorshipsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("active");
  const [dissolveId, setDissolveId] = useState<number | null>(null);
  const [dissolving, setDissolving] = useState(false);
  const [dissolveError, setDissolveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get<AdminMentorshipsData>("/api/admin/mentorships/");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDissolve() {
    if (dissolveId === null) return;
    setDissolving(true);
    setDissolveError(null);
    try {
      await del(`/api/admin/assignments/${dissolveId}/`);
      setDissolveId(null);
      await fetchData();
    } catch (err) {
      setDissolveError(err instanceof Error ? err.message : t("errorDissolve"));
    } finally {
      setDissolving(false);
    }
  }

  const activeCount = data?.assignments.length ?? 0;
  const pendingCount = data?.requests.length ?? 0;

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {dissolveId !== null && (
        <DissolveModal
          assignmentId={dissolveId}
          onConfirm={handleDissolve}
          onCancel={() => { setDissolveId(null); setDissolveError(null); }}
          loading={dissolving}
        />
      )}

      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
          <ChevronLeft size={12} />
          {t("backLink")}
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{t("title")}</h1>
        {!loading && data && (
          <p className="font-mono text-[11px] text-muted mt-[3px]">
            {t("subtitle", { active: activeCount, pending: pendingCount })}
          </p>
        )}
      </div>

      {(error || dissolveError) && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error || dissolveError}</p>
          {error && (
            <button onClick={fetchData} className="ml-auto font-mono text-[10px] text-loss underline">
              {t("retry")}
            </button>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit overflow-hidden">
        {([
          { key: "active" as Tab, label: `${t("tabActive")} (${activeCount})` },
          { key: "pending" as Tab, label: `${t("tabPending")} (${pendingCount})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`font-mono text-[10px] px-4 py-[7px] transition-colors duration-150 ${
              tab === key ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Active assignments ── */}
      {tab === "active" && (
        <div className="card overflow-x-auto">
          <div className="hidden lg:grid grid-cols-[1fr_1fr_60px_60px_110px_90px] gap-3 px-5 py-3 border-b border-white/[0.06]">
            {[t("colMentor"), t("colTrader"), t("colPlan"), t("colTrades"), t("colSince"), t("colActions")].map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
            </div>
          ) : !data || data.assignments.length === 0 ? (
            <p className="p-16 text-center font-sans text-[14px] text-secondary">{t("emptyActive")}</p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block">
                {data.assignments.map((a) => (
                  <div
                    key={a.id}
                    className="grid grid-cols-[1fr_1fr_60px_60px_110px_90px] gap-3 px-5 py-3 border-b border-white/[0.04] items-center last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] font-medium text-primary truncate">{a.mentor.display_name}</p>
                      <p className="font-mono text-[10px] text-muted truncate">{a.mentor.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] font-medium text-primary truncate">{a.trader.display_name}</p>
                      <p className="font-mono text-[10px] text-muted truncate">{a.trader.email}</p>
                    </div>
                    <span className={`font-mono text-[9px] uppercase px-1.5 py-[2px] w-fit ${
                      a.trader.plan === "pro"
                        ? "text-green/80 border border-green/25"
                        : "text-muted border border-white/[0.08]"
                    }`}>
                      {a.trader.plan}
                    </span>
                    <span className="font-mono text-[11px] text-secondary tabular-nums">
                      {a.trader.trade_count}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {new Date(a.assigned_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setDissolveId(a.id)}
                      className="font-mono text-[10px] text-loss hover:underline w-fit"
                    >
                      {t("dissolve")}
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="lg:hidden divide-y divide-white/[0.05]">
                {data.assignments.map((a) => (
                  <div key={a.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-[12px] font-medium text-primary">
                          {a.mentor.display_name} → {a.trader.display_name}
                        </p>
                        <p className="font-mono text-[10px] text-muted mt-[2px]">
                          {a.trader.trade_count} ops · {new Date(a.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setDissolveId(a.id)}
                        className="font-mono text-[10px] text-loss hover:underline flex-shrink-0"
                      >
                        {t("dissolve")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Pending requests ── */}
      {tab === "pending" && (
        <div className="card overflow-x-auto">
          <div className="hidden lg:grid grid-cols-[1fr_1fr_120px_120px] gap-3 px-5 py-3 border-b border-white/[0.06]">
            {[t("colMentor"), t("colTrader"), t("colStatus"), t("colSince")].map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
            </div>
          ) : !data || data.requests.length === 0 ? (
            <p className="p-16 text-center font-sans text-[14px] text-secondary">{t("emptyPending")}</p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block">
                {data.requests.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[1fr_1fr_120px_120px] gap-3 px-5 py-3 border-b border-white/[0.04] items-center last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] font-medium text-primary truncate">{r.mentor.display_name}</p>
                      <p className="font-mono text-[10px] text-muted truncate">{r.mentor.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[12px] font-medium text-primary truncate">{r.trader.display_name}</p>
                      <p className="font-mono text-[10px] text-muted truncate">{r.trader.email}</p>
                    </div>
                    <span className="font-mono text-[10px] text-muted uppercase tracking-[0.06em]">
                      {t("statusPending")}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="lg:hidden divide-y divide-white/[0.05]">
                {data.requests.map((r) => (
                  <div key={r.id} className="px-5 py-4">
                    <p className="font-sans text-[12px] font-medium text-primary">
                      {r.mentor.display_name} → {r.trader.display_name}
                    </p>
                    <p className="font-mono text-[10px] text-muted mt-[2px]">
                      {t("statusPending")} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

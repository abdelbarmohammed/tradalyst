"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, AlertCircle, Download, X } from "lucide-react";
import { get } from "@/lib/api";
import { formatDateMedium } from "@/lib/format";
import type { AdminUserEnhanced, Trade } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUserEnhanced[];
}

type RoleFilter = "" | "trader" | "mentor" | "admin";

const PAGE_SIZE = 20;

function TabGroup({
  options, value, onChange,
}: { options: { value: RoleFilter; label: string }[]; value: RoleFilter; onChange: (v: RoleFilter) => void }) {
  return (
    <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit overflow-hidden">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`font-mono text-[10px] px-3 py-[6px] transition-colors duration-150 ${
            value === opt.value ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
          }`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TradesModal({
  user, onClose,
}: {
  user: AdminUserEnhanced;
  onClose: () => void;
}) {
  const t = useTranslations("adminUsers");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<Trade[]>(`/api/admin/users/${user.id}/trades/`)
      .then(setTrades)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-elevated border border-white/[0.08] w-full max-w-[700px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div>
            <p className="font-sans text-[14px] font-semibold text-primary">
              {t("tradesModalTitle", { name: user.display_name || user.email })}
            </p>
            <p className="font-mono text-[10px] text-muted mt-[1px]">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-sm" />)}
            </div>
          ) : trades.length === 0 ? (
            <p className="p-10 text-center font-sans text-[13px] text-secondary">
              {t("tradesModalEmpty")}
            </p>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-[100px_60px_80px_80px_80px_80px_80px] gap-3 px-5 py-2 border-b border-white/[0.04]">
                {["Par", "Dir.", "Entrada", "Salida", "P&L", "Resultado", "Fecha"].map((h) => (
                  <span key={h} className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{h}</span>
                ))}
              </div>
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="grid grid-cols-[100px_60px_80px_80px_80px_80px_80px] gap-3 px-5 py-3 border-b border-white/[0.04] items-center last:border-0"
                >
                  <span className="font-mono text-[11px] text-primary font-medium">{trade.pair}</span>
                  <span className={`font-mono text-[10px] uppercase ${
                    trade.direction === "long" ? "text-profit" : "text-loss"
                  }`}>
                    {trade.direction}
                  </span>
                  <span className="font-mono text-[10px] text-secondary tabular-nums">{trade.entry_price}</span>
                  <span className="font-mono text-[10px] text-secondary tabular-nums">
                    {trade.exit_price ?? "—"}
                  </span>
                  <span className={`font-mono text-[10px] tabular-nums ${
                    trade.pnl === null ? "text-muted"
                    : parseFloat(trade.pnl) >= 0 ? "text-profit" : "text-loss"
                  }`}>
                    {trade.pnl !== null ? parseFloat(trade.pnl).toFixed(2) : "—"}
                  </span>
                  <span className={`font-mono text-[9px] uppercase px-1.5 py-[2px] w-fit ${
                    trade.result === "win" ? "text-profit border border-profit/25"
                    : trade.result === "loss" ? "text-loss border border-loss/25"
                    : "text-muted border border-white/[0.08]"
                  }`}>
                    {trade.result || "open"}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {new Date(trade.entry_time).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="font-mono text-[11px] text-muted hover:text-primary transition-colors px-3 py-1.5 border border-white/[0.08] hover:border-white/20"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const t = useTranslations("adminUsers");

  const ROLE_TABS: { value: RoleFilter; label: string }[] = [
    { value: "", label: t("tabAll") },
    { value: "trader", label: t("tabTraders") },
    { value: "mentor", label: t("tabMentors") },
    { value: "admin", label: t("tabAdmins") },
  ];

  const [users, setUsers] = useState<AdminUserEnhanced[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradesUser, setTradesUser] = useState<AdminUserEnhanced | null>(null);
  const [exporting, setExporting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback((role: RoleFilter, q: string, p: number): string => {
    const params = new URLSearchParams();
    params.set("ordering", "-date_joined");
    params.set("page_size", String(PAGE_SIZE));
    params.set("page", String(p));
    if (role) params.set("role", role);
    if (q) params.set("search", q);
    return params.toString();
  }, []);

  const fetchUsers = useCallback(async (role: RoleFilter, q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await get<UserListResponse>(`/api/users/?${buildParams(role, q, p)}`);
      setUsers(res.results);
      setCount(res.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [buildParams, t]);

  useEffect(() => {
    fetchUsers(roleFilter, search, page);
  }, [roleFilter, search, page, fetchUsers]);

  function handleRoleChange(role: RoleFilter) {
    setPage(1);
    setRoleFilter(role);
  }

  function handleSearchInput(raw: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(raw.trim());
    }, 350);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/export/users/`, { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tradalyst_users.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent — CSV export failure is non-critical
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {tradesUser && (
        <TradesModal user={tradesUser} onClose={() => setTradesUser(null)} />
      )}

      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
          <ChevronLeft size={12} />
          {t("backLink")}
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{t("title")}</h1>
            {!loading && (
              <p className="font-mono text-[11px] text-muted mt-[3px]">
                {count} {count === 1 ? t("userCountOne") : t("userCountMany")}
              </p>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted border border-white/[0.08] px-3 py-[7px] hover:text-primary hover:border-white/20 transition-colors disabled:opacity-40"
          >
            <Download size={12} />
            {t("exportCsv")}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
          <button onClick={() => fetchUsers(roleFilter, search, page)} className="ml-auto font-mono text-[10px] text-loss underline">
            {t("retry")}
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full sm:w-64 bg-surface border border-white/[0.08] px-3 py-[8px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors"
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">{t("roleLabel")}</span>
          <TabGroup options={ROLE_TABS} value={roleFilter} onChange={handleRoleChange} />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-x-auto">
        <div className="hidden lg:grid grid-cols-[1fr_150px_80px_60px_100px_130px_80px_110px] gap-3 px-5 py-3 border-b border-white/[0.06]">
          {[
            t("colEmail"), t("colName"), t("colRole"), t("colTrades"),
            t("colLastActive"), t("colMentor"), t("colStatus"), t("colActions"),
          ].map((h) => (
            <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-sans text-[14px] text-secondary">{t("noUsers")}</p>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <div className="hidden lg:block">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1fr_150px_80px_60px_100px_130px_80px_110px] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors items-center cursor-pointer"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <span className="font-mono text-[11px] text-secondary truncate">{user.email}</span>
                  <span className="font-sans text-[12px] font-medium text-primary truncate">
                    {user.display_name || "—"}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[3px] w-fit ${
                    user.role === "trader" ? "text-secondary border border-white/[0.1]"
                    : user.role === "mentor" ? "text-green/80 border border-green/20"
                    : "text-primary border border-white/[0.2]"
                  }`}>
                    {user.role}
                  </span>
                  <span className="font-mono text-[11px] text-secondary tabular-nums">
                    {user.trade_count ?? 0}
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    {user.last_active ?? "—"}
                  </span>
                  <span className="font-mono text-[11px] text-muted truncate">
                    {user.role === "trader" && user.mentor_name
                      ? user.mentor_name
                      : user.role === "mentor" && user.student_count !== null
                        ? t("students", { count: user.student_count })
                        : "—"}
                  </span>
                  <span className={`font-mono text-[10px] ${user.is_active ? "text-profit" : "text-loss"}`}>
                    {user.is_active ? t("statusActive") : t("statusSuspended")}
                  </span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-mono text-[10px] text-green hover:underline"
                    >
                      {t("viewLink")}
                    </Link>
                    {user.role === "trader" && (
                      <button
                        onClick={() => setTradesUser(user)}
                        className="font-mono text-[10px] text-muted hover:text-primary transition-colors"
                      >
                        {t("viewTrades")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-white/[0.05]">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-medium text-primary truncate">
                      {user.display_name || user.email}
                    </p>
                    <p className="font-mono text-[10px] text-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-secondary">
                        {user.trade_count ?? 0} ops
                      </span>
                      <span className="text-muted font-mono text-[10px]">·</span>
                      <span className="font-mono text-[10px] text-muted">{formatDateMedium(user.date_joined)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[3px] ${
                      user.role === "trader" ? "text-secondary border border-white/[0.1]"
                      : user.role === "mentor" ? "text-green/80 border border-green/20"
                      : "text-primary border border-white/[0.2]"
                    }`}>
                      {user.role}
                    </span>
                    {!user.is_active && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-loss border border-loss/30 px-2 py-[3px]">
                        {t("statusSuspended")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted">
            {t("pageInfo", { page, total: totalPages, count })}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`font-mono text-[11px] w-7 h-7 transition-colors ${
                  page === n ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
                }`}>
                {n}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle, X, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { get, del } from "@/lib/api";
import { formatDateShort, formatPnl } from "@/lib/format";
import type { Trade, PaginatedTrades } from "@/types";
import CsvImportModal from "@/components/journal/CsvImportModal";

// ── Filter types ──────────────────────────────────────────────────────────────

type DirectionFilter = "" | "long" | "short";
type ResultFilter = "" | "win" | "loss" | "breakeven";
type EmotionFilter = "" | "confident" | "fomo" | "fearful" | "revenge";

interface Filters {
  pair: string;
  direction: DirectionFilter;
  result: ResultFilter;
  emotion: EmotionFilter;
  after: string;
  before: string;
}

const EMPTY_FILTERS: Filters = {
  pair: "",
  direction: "",
  result: "",
  emotion: "",
  after: "",
  before: "",
};

const PAGE_SIZE = 20;

// ── Filter pill tab group ─────────────────────────────────────────────────────

function TabGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit rounded-sm overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`font-mono text-[10px] px-3 py-[6px] transition-colors duration-150 ${
            value === opt.value
              ? "bg-elevated text-primary"
              : "text-muted hover:text-secondary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteModal({
  trade,
  onConfirm,
  onCancel,
  deleting,
  t,
}: {
  trade: Trade;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">
          {t("deleteConfirmTitle")}
        </p>
        <p className="font-sans text-[14px] text-primary mb-1">
          {t("deleteBodyPrefix")}{" "}
          <span className="font-semibold">{trade.pair}</span>?
        </p>
        <p className="font-mono text-[11px] text-muted mb-6">
          {formatDateShort(trade.entry_time)} · {t("deleteBodyNote")}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            {t("deleteCancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 font-sans text-[13px] font-semibold px-4 py-[9px] bg-loss/80 hover:bg-loss text-white transition-colors disabled:opacity-50"
          >
            {deleting ? t("deleting") : t("deleteConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const router = useRouter();
  const t = useTranslations("journal");

  const DIRECTION_TABS: { value: DirectionFilter; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "long", label: "Long" },
    { value: "short", label: "Short" },
  ];

  const RESULT_TABS: { value: ResultFilter; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "win", label: "Win" },
    { value: "loss", label: "Loss" },
    { value: "breakeven", label: "BE" },
  ];

  const EMOTION_TABS: { value: EmotionFilter; label: string }[] = [
    { value: "", label: t("filterAll") },
    { value: "confident", label: t("emotions.confident") },
    { value: "fomo", label: "FOMO" },
    { value: "fearful", label: t("emotions.fearful") },
    { value: "revenge", label: "Revenge" },
  ];

  const EMOTION_LABELS: Record<string, string> = {
    calm:      t("emotions.calm"),
    confident: t("emotions.confident"),
    fearful:   t("emotions.fearful"),
    greedy:    t("emotions.greedy"),
    anxious:   t("emotions.anxious"),
    fomo:      "FOMO",
    revenge:   "Revenge",
    neutral:   t("emotions.neutral"),
  };

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const pairInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(
    (f: Filters, p: number): string => {
      const params = new URLSearchParams();
      params.set("ordering", "-entry_time");
      params.set("page_size", String(PAGE_SIZE));
      params.set("page", String(p));
      if (f.pair) params.set("pair", f.pair);
      if (f.direction) params.set("direction", f.direction);
      if (f.result) params.set("result", f.result);
      if (f.emotion) params.set("emotion", f.emotion);
      if (f.after) params.set("entry_time_after", f.after);
      if (f.before) params.set("entry_time_before", f.before);
      return params.toString();
    },
    []
  );

  const fetchTrades = useCallback(
    async (f: Filters, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await get<PaginatedTrades>(`/api/trades/?${buildParams(f, p)}`);
        setTrades(res.results);
        setCount(res.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorLoad"));
      } finally {
        setLoading(false);
      }
    },
    [buildParams, t]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const date = params.get("date");
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFilters((f) => ({ ...f, after: `${date}T00:00:00`, before: `${date}T23:59:59` }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTrades(filters, page);
  }, [filters, page, fetchTrades]);

  function handleFilterChange<K extends keyof Filters>(key: K, value: Filters[K]) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handlePairInput(raw: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFilterChange("pair", raw.trim());
    }, 350);
  }

  function clearFilters() {
    setPage(1);
    setFilters(EMPTY_FILTERS);
    if (pairInputRef.current) pairInputRef.current.value = "";
  }

  const hasActiveFilters =
    filters.pair || filters.direction || filters.result ||
    filters.emotion || filters.after || filters.before;

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/api/trades/${deleteTarget.id}/`);
      setDeleteTarget(null);
      fetchTrades(filters, page);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const tradeCountLabel =
    count === 1 ? t("tradeCountSingle") : t("tradeCountPlural", { count });

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          trade={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
          t={t}
        />
      )}

      {showImportModal && (
        <CsvImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => fetchTrades(filters, 1)}
        />
      )}

      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
              {t("title")}
            </h1>
            {!loading && (
              <p className="font-mono text-[11px] text-muted mt-[3px]">
                {tradeCountLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 font-sans text-[13px] font-semibold px-4 py-[9px] text-secondary hover:text-primary transition-colors duration-150"
              style={{ border: "1px solid var(--border)" }}
            >
              <Upload size={14} />
              {t("importCsv")}
            </button>
            <Link
              href="/journal/new"
              className="flex items-center gap-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-4 py-[9px] rounded transition-colors duration-150"
            >
              <Plus size={14} />
              {t("newTrade")}
            </Link>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
            <AlertCircle size={15} className="text-loss flex-shrink-0" />
            <p className="font-sans text-[13px] text-loss">{error}</p>
            <button
              onClick={() => fetchTrades(filters, page)}
              className="ml-auto font-mono text-[10px] text-loss underline"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="space-y-3">
          <input
            ref={pairInputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            onChange={(e) => handlePairInput(e.target.value)}
            className="w-full sm:w-64 bg-surface border border-white/[0.08] px-3 py-[8px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors"
          />

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">
                {t("filterDirLabel")}
              </span>
              <TabGroup
                options={DIRECTION_TABS}
                value={filters.direction}
                onChange={(v) => handleFilterChange("direction", v)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">
                {t("filterResultLabel")}
              </span>
              <TabGroup
                options={RESULT_TABS}
                value={filters.result}
                onChange={(v) => handleFilterChange("result", v)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">
                {t("filterEmotionLabel")}
              </span>
              <TabGroup
                options={EMOTION_TABS}
                value={filters.emotion}
                onChange={(v) => handleFilterChange("emotion", v)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">
                {t("filterFrom")}
              </span>
              <input
                type="date"
                value={filters.after}
                onChange={(e) => handleFilterChange("after", e.target.value)}
                className="bg-surface border border-white/[0.08] px-2 py-[6px] font-mono text-[11px] text-secondary focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">
                {t("filterTo")}
              </span>
              <input
                type="date"
                value={filters.before}
                onChange={(e) => handleFilterChange("before", e.target.value)}
                className="bg-surface border border-white/[0.08] px-2 py-[6px] font-mono text-[11px] text-secondary focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="font-mono text-[10px] text-muted hover:text-secondary underline transition-colors"
              >
                {t("filterClear")}
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card overflow-x-auto">
          <div className="hidden lg:grid grid-cols-[140px_120px_70px_100px_100px_90px_80px_100px_80px] gap-2 px-5 py-3 border-b border-white/[0.06]">
            {[
              t("colDate"), t("colPair"), t("colDir"), t("colEntry"), t("colExit"),
              t("colPnl"), t("colResult"), t("colEmotion"), t("colActions"),
            ].map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-full rounded-sm" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <div className="p-16 flex flex-col items-center text-center gap-4">
              <p className="font-sans text-[14px] text-secondary">
                {hasActiveFilters ? t("emptyState") : t("emptyNoTrades")}
              </p>
              {!hasActiveFilters && (
                <Link
                  href="/journal/new"
                  className="flex items-center gap-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-5 py-[10px] rounded transition-colors duration-150"
                >
                  <Plus size={14} />
                  {t("newTrade")}
                </Link>
              )}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="font-mono text-[11px] text-green hover:underline">
                  {t("clearFilters")}
                </button>
              )}
            </div>
          ) : (
            trades.map((t_) => {
              const pnl = t_.pnl !== null ? parseFloat(t_.pnl) : null;
              const isLong = t_.direction === "long";
              const isWin = t_.result === "win";
              const isLoss = t_.result === "loss";

              return (
                <div
                  key={t_.id}
                  className="group grid grid-cols-[1fr_auto] lg:grid-cols-[140px_120px_70px_100px_100px_90px_80px_100px_80px] gap-2 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-100 items-center cursor-pointer"
                  onClick={() => router.push(`/journal/${t_.id}`)}
                >
                  <span className="font-mono text-[11px] text-secondary">
                    {formatDateShort(t_.entry_time)}
                  </span>
                  <span className="font-sans text-[12px] font-semibold text-primary">
                    {t_.pair}
                  </span>
                  <span className={`hidden lg:inline-flex font-mono text-[10px] px-2 py-[2px] w-fit ${isLong ? "pill-long" : "pill-short"}`}>
                    {isLong ? "Long" : "Short"}
                  </span>
                  <span className="hidden lg:block font-mono text-[11px] tabular-nums text-secondary">
                    {parseFloat(t_.entry_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </span>
                  <span className="hidden lg:block font-mono text-[11px] tabular-nums text-secondary">
                    {t_.exit_price
                      ? parseFloat(t_.exit_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 5 })
                      : "—"}
                  </span>
                  <span className={`hidden lg:block font-mono text-[11px] tabular-nums ${pnl === null ? "text-muted" : pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {pnl !== null ? formatPnl(pnl) : "—"}
                  </span>
                  <span className="hidden lg:block">
                    {t_.result ? (
                      <span className={`font-mono text-[10px] px-2 py-[2px] ${isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"}`}>
                        {isWin ? "Win" : isLoss ? "Loss" : "BE"}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-muted">—</span>
                    )}
                  </span>
                  <span className="hidden lg:block font-mono text-[10px] text-secondary">
                    {t_.emotion ? (EMOTION_LABELS[t_.emotion] ?? t_.emotion) : "—"}
                  </span>
                  <div
                    className="flex items-center gap-3 justify-end lg:justify-start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/journal/${t_.id}`} className="text-muted hover:text-secondary transition-colors">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/journal/${t_.id}/edit`} className="text-muted hover:text-secondary transition-colors">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => setDeleteTarget(t_)} className="text-muted hover:text-loss transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted">
              {t("pageInfo", { page, total: totalPages, count })}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .reduce<(number | "…")[]>((acc, n, i, arr) => {
                  if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "…" ? (
                    <span key={`ellipsis-${i}`} className="font-mono text-[11px] text-muted px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`font-mono text-[11px] w-7 h-7 transition-colors ${page === item ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

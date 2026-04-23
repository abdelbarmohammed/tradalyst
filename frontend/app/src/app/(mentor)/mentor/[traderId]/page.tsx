"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Eye, LayoutDashboard, AlertCircle,
} from "lucide-react";
import { get } from "@/lib/api";
import { formatDateShort, formatPnl } from "@/lib/format";
import type { Trade, PaginatedTrades, MentorAssignment } from "@/types";

type DirectionFilter = "" | "long" | "short";
type ResultFilter = "" | "win" | "loss" | "breakeven";

interface Filters {
  pair: string;
  direction: DirectionFilter;
  result: ResultFilter;
  after: string;
  before: string;
}

const EMPTY_FILTERS: Filters = { pair: "", direction: "", result: "", after: "", before: "" };
const PAGE_SIZE = 20;

const EMOTION_LABELS: Record<string, string> = {
  calm: "Tranquilo", confident: "Confiado", fearful: "Incierto",
  greedy: "Codicioso", anxious: "Ansioso", fomo: "FOMO",
  revenge: "Revenge", neutral: "Neutral",
};

function TabGroup<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit rounded-sm overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`font-mono text-[10px] px-3 py-[6px] transition-colors duration-150 ${
            value === opt.value ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function MentorTraderJournalPage() {
  const { traderId } = useParams<{ traderId: string }>();
  const router = useRouter();

  const [traderName, setTraderName] = useState<string>("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pairInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    get<{ count: number; results: MentorAssignment[] }>("/api/mentors/my-traders/")
      .then((res) => {
        const match = res.results.find((a) => String(a.trader_detail.id) === traderId);
        if (match) setTraderName(match.trader_detail.display_name || match.trader_detail.email);
      })
      .catch(() => {});
  }, [traderId]);

  const buildParams = useCallback((f: Filters, p: number): string => {
    const params = new URLSearchParams();
    params.set("ordering", "-entry_time");
    params.set("page_size", String(PAGE_SIZE));
    params.set("page", String(p));
    if (f.pair) params.set("pair", f.pair);
    if (f.direction) params.set("direction", f.direction);
    if (f.result) params.set("result", f.result);
    if (f.after) params.set("entry_time_after", f.after);
    if (f.before) params.set("entry_time_before", f.before);
    return params.toString();
  }, []);

  const fetchTrades = useCallback(async (f: Filters, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await get<PaginatedTrades>(
        `/api/mentors/traders/${traderId}/trades/?${buildParams(f, p)}`
      );
      setTrades(res.results);
      setCount(res.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las operaciones.");
    } finally {
      setLoading(false);
    }
  }, [traderId, buildParams]);

  useEffect(() => {
    fetchTrades(filters, page);
  }, [filters, page, fetchTrades]);

  function handleFilterChange<K extends keyof Filters>(key: K, value: Filters[K]) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handlePairInput(raw: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleFilterChange("pair", raw.trim()), 350);
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/mentor"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3"
          >
            <ChevronLeft size={12} />
            Mis traders
          </Link>
          <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
            {traderName || "Cargando…"}
          </h1>
          {!loading && (
            <p className="font-mono text-[11px] text-muted mt-[3px]">
              {count} {count === 1 ? "operación" : "operaciones"}
            </p>
          )}
        </div>
        <Link
          href={`/mentor/${traderId}/dashboard`}
          className="flex items-center gap-2 flex-shrink-0 font-sans text-[12px] font-semibold border border-white/[0.12] text-secondary hover:text-primary px-4 py-[8px] transition-colors"
        >
          <LayoutDashboard size={13} />
          Dashboard
        </Link>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
          <button onClick={() => fetchTrades(filters, page)} className="ml-auto font-mono text-[10px] text-loss underline">
            Reintentar
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="space-y-3">
        <input
          ref={pairInputRef}
          type="text"
          placeholder="Buscar por activo (BTC, EURUSD…)"
          onChange={(e) => handlePairInput(e.target.value)}
          className="w-full sm:w-64 bg-surface border border-white/[0.08] px-3 py-[8px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">Dir.</span>
            <TabGroup
              options={[{ value: "" as DirectionFilter, label: "Todos" }, { value: "long", label: "Long" }, { value: "short", label: "Short" }]}
              value={filters.direction}
              onChange={(v) => handleFilterChange("direction", v)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">Result.</span>
            <TabGroup
              options={[{ value: "" as ResultFilter, label: "Todos" }, { value: "win", label: "Win" }, { value: "loss", label: "Loss" }, { value: "breakeven", label: "BE" }]}
              value={filters.result}
              onChange={(v) => handleFilterChange("result", v)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">Desde</span>
            <input type="date" value={filters.after} onChange={(e) => handleFilterChange("after", e.target.value)}
              className="bg-surface border border-white/[0.08] px-2 py-[6px] font-mono text-[11px] text-secondary focus:outline-none focus:border-white/20 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">Hasta</span>
            <input type="date" value={filters.before} onChange={(e) => handleFilterChange("before", e.target.value)}
              className="bg-surface border border-white/[0.08] px-2 py-[6px] font-mono text-[11px] text-secondary focus:outline-none focus:border-white/20 transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card overflow-x-auto">
        <div className="hidden lg:grid grid-cols-[140px_120px_70px_100px_100px_90px_80px_100px_60px] gap-2 px-5 py-3 border-b border-white/[0.06]">
          {["Fecha", "Activo", "Dir.", "Entrada", "Salida", "P&L", "Result.", "Emoción", "Ver"].map((h) => (
            <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-sm" />)}
          </div>
        ) : trades.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-sans text-[14px] text-secondary">
              Este trader aún no tiene operaciones registradas.
            </p>
          </div>
        ) : (
          trades.map((t) => {
            const pnl = t.pnl !== null ? parseFloat(t.pnl) : null;
            const isLong = t.direction === "long";
            const isWin = t.result === "win";
            const isLoss = t.result === "loss";

            return (
              <div
                key={t.id}
                className="group grid grid-cols-[1fr_auto] lg:grid-cols-[140px_120px_70px_100px_100px_90px_80px_100px_60px] gap-2 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-100 items-center cursor-pointer"
                onClick={() => router.push(`/mentor/${traderId}/trade/${t.id}`)}
              >
                <span className="font-mono text-[11px] text-secondary">{formatDateShort(t.entry_time)}</span>
                <span className="font-sans text-[12px] font-semibold text-primary">{t.pair}</span>
                <span className={`hidden lg:inline-flex font-mono text-[10px] px-2 py-[2px] w-fit ${isLong ? "pill-long" : "pill-short"}`}>
                  {isLong ? "Long" : "Short"}
                </span>
                <span className="hidden lg:block font-mono text-[11px] tabular-nums text-secondary">
                  {parseFloat(t.entry_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                </span>
                <span className="hidden lg:block font-mono text-[11px] tabular-nums text-secondary">
                  {t.exit_price ? parseFloat(t.exit_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : "—"}
                </span>
                <span className={`hidden lg:block font-mono text-[11px] tabular-nums ${pnl === null ? "text-muted" : pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {pnl !== null ? formatPnl(pnl) : "—"}
                </span>
                <span className="hidden lg:block">
                  {t.result ? (
                    <span className={`font-mono text-[10px] px-2 py-[2px] ${isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"}`}>
                      {isWin ? "Win" : isLoss ? "Loss" : "BE"}
                    </span>
                  ) : <span className="font-mono text-[10px] text-muted">—</span>}
                </span>
                <span className="hidden lg:block font-mono text-[10px] text-secondary">
                  {t.emotion ? (EMOTION_LABELS[t.emotion] ?? t.emotion) : "—"}
                </span>
                <div className="flex items-center gap-2 justify-end lg:justify-start" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/mentor/${traderId}/trade/${t.id}`} className="text-muted hover:text-secondary transition-colors" title="Ver detalle">
                    <Eye size={14} />
                  </Link>
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
            Página {page} de {totalPages} · {count} resultados
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
                  <button key={item} onClick={() => setPage(item as number)}
                    className={`font-mono text-[11px] w-7 h-7 transition-colors ${page === item ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}>
                    {item}
                  </button>
                )
              )}
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

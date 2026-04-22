"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { get } from "@/lib/api";
import { formatPnl, formatPct, formatRR, formatCount, getGreeting, formatDateLong } from "@/lib/format";
import type {
  UserProfile, Trade, PaginatedTrades,
  TradeStats, AiInsight, DateRange, PnlPoint, HeatmapDay,
} from "@/types";

import StatCard from "@/components/dashboard/StatCard";
import PricesStrip from "@/components/dashboard/PricesStrip";
import PnlChart from "@/components/dashboard/PnlChart";
import AiInsightCard from "@/components/dashboard/AiInsightCard";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import RecentTradesTable from "@/components/dashboard/RecentTradesTable";

// ── Date range helpers ────────────────────────────────────────────────────────

function getDateBounds(range: DateRange): { after?: string; before?: string } {
  const now = new Date();
  if (range === "all") return {};

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { after: start.toISOString() };
  }

  if (range === "week") {
    const dow = (now.getDay() + 6) % 7; // 0=Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    return { after: monday.toISOString() };
  }

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { after: start.toISOString() };
}

function buildTradesParams(bounds: { after?: string; before?: string }, extra = ""): string {
  const params = new URLSearchParams();
  params.set("ordering", "entry_time");
  params.set("page_size", "500");
  if (bounds.after) params.set("entry_time_after", bounds.after);
  if (bounds.before) params.set("entry_time_before", bounds.before);
  return `${params.toString()}${extra}`;
}

// ── Stats computation from trades list ────────────────────────────────────────

function computeStats(trades: Trade[]): TradeStats {
  const closed = trades.filter((t) => t.pnl !== null);
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;
  const be = closed.filter((t) => t.result === "breakeven").length;

  const totalPnl = closed.reduce((s, t) => s + parseFloat(t.pnl!), 0);
  const rrVals = closed
    .filter((t) => t.risk_reward_ratio !== null)
    .map((t) => parseFloat(t.risk_reward_ratio!));
  const avgRr = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : null;

  return {
    total_trades: trades.length,
    closed_trades: closed.length,
    winning_trades: wins,
    losing_trades: losses,
    breakeven_trades: be,
    win_rate: closed.length ? (wins / closed.length) * 100 : 0,
    total_pnl: totalPnl.toString(),
    avg_pnl_per_trade: closed.length ? (totalPnl / closed.length).toString() : "0",
    avg_risk_reward: avgRr !== null ? avgRr.toString() : null,
    max_drawdown: "0",
    best_trade_pnl: null,
    worst_trade_pnl: null,
    most_traded_pair: null,
  };
}

function computePnlCurve(trades: Trade[]): PnlPoint[] {
  let cum = 0;
  return trades
    .filter((t) => t.pnl !== null)
    .map((t) => {
      cum += parseFloat(t.pnl!);
      return {
        date: t.entry_time.slice(0, 10),
        cumPnl: cum,
      };
    });
}

function computeHeatmap(trades: Trade[]): HeatmapDay[] {
  const map = new Map<string, { pnl: number; count: number }>();
  for (const t of trades) {
    const day = t.entry_time.slice(0, 10);
    const pnl = t.pnl !== null ? parseFloat(t.pnl) : 0;
    const prev = map.get(day) ?? { pnl: 0, count: 0 };
    map.set(day, { pnl: prev.pnl + pnl, count: prev.count + 1 });
  }
  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    pnl: v.pnl,
    tradeCount: v.count,
  }));
}

// ── Date range tabs ───────────────────────────────────────────────────────────

const DATE_TABS: { value: DateRange; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week",  label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "all",   label: "Todo" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [pnlCurve, setPnlCurve] = useState<PnlPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const bounds = getDateBounds(range);

      const [userRes, tradesRes, recentRes, insightRes] = await Promise.all([
        get<UserProfile>("/api/users/me/"),
        get<PaginatedTrades>(`/api/trades/?${buildTradesParams(bounds)}`),
        get<PaginatedTrades>("/api/trades/?ordering=-entry_time&page_size=5"),
        get<{ results: AiInsight[] }>("/api/analysis/insights/?page_size=1").catch(() => ({ results: [] })),
      ]);

      const trades = tradesRes.results;

      setUser(userRes);
      setStats(computeStats(trades));
      setPnlCurve(computePnlCurve(trades));
      setHeatmap(computeHeatmap(trades));
      setRecentTrades(recentRes.results);
      setInsight(insightRes.results[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  const totalTrades = stats?.total_trades ?? 0;
  const totalPnl = stats ? parseFloat(stats.total_pnl) : 0;
  const isEmpty = !loading && totalTrades === 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
            {getGreeting()}{user?.display_name ? `, ${user.display_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="font-mono text-[11px] text-muted mt-[3px]">
            {formatDateLong(new Date())}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 flex-shrink-0 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-4 py-[9px] rounded transition-colors duration-150"
        >
          <Plus size={14} />
          Nueva operación
        </Link>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
          <button
            onClick={() => fetchData(dateRange)}
            className="ml-auto font-mono text-[10px] text-loss underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Date range filter ── */}
      <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit rounded-sm overflow-hidden">
        {DATE_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`font-mono text-[11px] px-4 py-[7px] transition-colors duration-150 ${
              dateRange === value
                ? "bg-elevated text-primary"
                : "text-muted hover:text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Empty state (zero trades) ── */}
      {isEmpty && !error && (
        <div className="card p-12 flex flex-col items-center text-center gap-4">
          <p className="font-sans text-[15px] text-secondary">
            Aún no tienes operaciones registradas.
          </p>
          <Link
            href="/journal/new"
            className="flex items-center gap-2 font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[10px] rounded transition-colors duration-150"
          >
            <Plus size={14} />
            Registrar primera operación
          </Link>
        </div>
      )}

      {/* ── Dashboard content (only when not empty or loading) ── */}
      {(!isEmpty || loading) && (
        <>
          {/* Row 1 — Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="P&L Total"
              value={stats ? formatPnl(totalPnl) : "—"}
              positive={stats ? totalPnl > 0 : undefined}
              loading={loading}
            />
            <StatCard
              label="Win Rate"
              value={stats ? formatPct(stats.win_rate) : "—"}
              positive={stats ? stats.win_rate >= 50 : undefined}
              sub={stats ? `${stats.winning_trades}W / ${stats.losing_trades}L` : undefined}
              loading={loading}
            />
            <StatCard
              label="Operaciones"
              value={stats ? formatCount(stats.total_trades) : "—"}
              loading={loading}
            />
            <StatCard
              label="R:R Medio"
              value={stats?.avg_risk_reward ? formatRR(parseFloat(stats.avg_risk_reward)) : "—"}
              positive={
                stats?.avg_risk_reward
                  ? parseFloat(stats.avg_risk_reward) >= 1
                  : undefined
              }
              loading={loading}
            />
          </div>

          {/* Row 2 — Prices strip */}
          <PricesStrip />

          {/* Row 3 — P&L chart + AI insight */}
          <div className="grid lg:grid-cols-[65fr_35fr] gap-3">
            <PnlChart data={pnlCurve} loading={loading} />
            <AiInsightCard insight={insight} stats={stats} loading={loading} />
          </div>

          {/* Row 4 — Heatmap */}
          <ActivityHeatmap data={heatmap} loading={loading} />

          {/* Row 5 — Recent trades */}
          <RecentTradesTable trades={recentTrades} loading={loading} />
        </>
      )}
    </div>
  );
}

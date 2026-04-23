"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, BookOpen, AlertCircle } from "lucide-react";
import { get } from "@/lib/api";
import { formatPnl, formatPct, formatRR, formatCount, formatDateShort } from "@/lib/format";
import type { Trade, PaginatedTrades, TradeStats, MentorAssignment, PnlPoint, HeatmapDay } from "@/types";

import StatCard from "@/components/dashboard/StatCard";
import PnlChart from "@/components/dashboard/PnlChart";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";

function computeStats(trades: Trade[]): TradeStats {
  const closed = trades.filter((t) => t.pnl !== null);
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;
  const be = closed.filter((t) => t.result === "breakeven").length;
  const totalPnl = closed.reduce((s, t) => s + parseFloat(t.pnl!), 0);
  const rrVals = closed.filter((t) => t.risk_reward_ratio !== null).map((t) => parseFloat(t.risk_reward_ratio!));
  const avgRr = rrVals.length ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length : null;
  return {
    total_trades: trades.length, closed_trades: closed.length,
    winning_trades: wins, losing_trades: losses, breakeven_trades: be,
    win_rate: closed.length ? (wins / closed.length) * 100 : 0,
    total_pnl: totalPnl.toString(),
    avg_pnl_per_trade: closed.length ? (totalPnl / closed.length).toString() : "0",
    avg_risk_reward: avgRr !== null ? avgRr.toString() : null,
    max_drawdown: "0", best_trade_pnl: null, worst_trade_pnl: null, most_traded_pair: null,
  };
}

function computePnlCurve(trades: Trade[]): PnlPoint[] {
  let cum = 0;
  return trades.filter((t) => t.pnl !== null).map((t) => {
    cum += parseFloat(t.pnl!);
    return { date: t.entry_time.slice(0, 10), cumPnl: cum };
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
  return Array.from(map.entries()).map(([date, v]) => ({ date, pnl: v.pnl, tradeCount: v.count }));
}

async function fetchAllTrades(traderId: string): Promise<Trade[]> {
  const first = await get<PaginatedTrades>(
    `/api/mentors/traders/${traderId}/trades/?ordering=entry_time&page_size=100`
  );
  let all = [...first.results];
  let next = first.next;
  while (next) {
    const url = new URL(next);
    const res = await get<PaginatedTrades>(
      `/api/mentors/traders/${traderId}/trades/?${url.searchParams.toString()}`
    );
    all = [...all, ...res.results];
    next = res.next;
  }
  return all;
}

export default function MentorTraderDashboardPage() {
  const { traderId } = useParams<{ traderId: string }>();

  const [traderName, setTraderName] = useState<string>("");
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [pnlCurve, setPnlCurve] = useState<PnlPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignmentsRes, allTrades, recentRes] = await Promise.all([
        get<{ count: number; results: MentorAssignment[] }>("/api/mentors/my-traders/"),
        fetchAllTrades(traderId),
        get<PaginatedTrades>(
          `/api/mentors/traders/${traderId}/trades/?ordering=-entry_time&page_size=5`
        ),
      ]);

      const match = assignmentsRes.results.find((a) => String(a.trader_detail.id) === traderId);
      if (match) setTraderName(match.trader_detail.display_name || match.trader_detail.email);

      setStats(computeStats(allTrades));
      setPnlCurve(computePnlCurve(allTrades));
      setHeatmap(computeHeatmap(allTrades));
      setRecentTrades(recentRes.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPnl = stats ? parseFloat(stats.total_pnl) : 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/mentor"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3"
          >
            <ChevronLeft size={12} />
            Mis traders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
              {traderName || "Cargando…"}
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted border border-white/[0.1] px-2 py-[3px]">
              Dashboard
            </span>
          </div>
        </div>
        <Link
          href={`/mentor/${traderId}`}
          className="flex items-center gap-2 flex-shrink-0 font-sans text-[12px] font-semibold border border-white/[0.12] text-secondary hover:text-primary px-4 py-[8px] transition-colors"
        >
          <BookOpen size={13} />
          Diario
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
          <button onClick={fetchData} className="ml-auto font-mono text-[10px] text-loss underline">Reintentar</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="P&L Total" value={stats ? formatPnl(totalPnl) : "—"} positive={stats ? totalPnl > 0 : undefined} loading={loading} />
        <StatCard label="Win Rate" value={stats ? formatPct(stats.win_rate) : "—"} positive={stats ? stats.win_rate >= 50 : undefined} sub={stats ? `${stats.winning_trades}W / ${stats.losing_trades}L` : undefined} loading={loading} />
        <StatCard label="Operaciones" value={stats ? formatCount(stats.total_trades) : "—"} loading={loading} />
        <StatCard label="R:R Medio" value={stats?.avg_risk_reward ? formatRR(parseFloat(stats.avg_risk_reward)) : "—"} positive={stats?.avg_risk_reward ? parseFloat(stats.avg_risk_reward) >= 1 : undefined} loading={loading} />
      </div>

      {/* ── P&L chart ── */}
      <PnlChart data={pnlCurve} loading={loading} />

      {/* ── Heatmap ── */}
      <ActivityHeatmap data={heatmap} loading={loading} />

      {/* ── Recent trades ── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">Operaciones recientes</p>
          <Link href={`/mentor/${traderId}`} className="font-mono text-[10px] text-green hover:underline">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-9 w-full rounded-sm" />)}
          </div>
        ) : recentTrades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-sans text-[13px] text-muted">Sin operaciones registradas.</p>
          </div>
        ) : (
          recentTrades.map((t) => {
            const pnl = t.pnl !== null ? parseFloat(t.pnl) : null;
            const isLong = t.direction === "long";
            const isWin = t.result === "win";
            const isLoss = t.result === "loss";
            return (
              <Link
                key={t.id}
                href={`/mentor/${traderId}/trade/${t.id}`}
                className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1.5fr_1fr_80px_80px_1fr] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors items-center"
              >
                <span className="font-mono text-[11px] text-secondary">{formatDateShort(t.entry_time)}</span>
                <span className="font-sans text-[12px] font-semibold text-primary">{t.pair}</span>
                <span className={`font-mono text-[10px] px-2 py-[2px] w-fit ${isLong ? "pill-long" : "pill-short"}`}>
                  {isLong ? "Long" : "Short"}
                </span>
                {t.result ? (
                  <span className={`font-mono text-[10px] px-2 py-[2px] w-fit ${isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"}`}>
                    {isWin ? "Win" : isLoss ? "Loss" : "BE"}
                  </span>
                ) : <span className="font-mono text-[10px] text-muted">—</span>}
                {pnl !== null ? (
                  <span className={`font-mono text-[11px] tabular-nums ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatPnl(pnl)}
                  </span>
                ) : <span className="font-mono text-[11px] text-muted">—</span>}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

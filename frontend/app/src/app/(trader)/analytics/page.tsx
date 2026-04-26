"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { get } from "@/lib/api";
import { formatPnl, formatPct } from "@/lib/format";
import type { Trade, PaginatedTrades } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function closedTrades(trades: Trade[]) {
  return trades.filter((t) => t.pnl !== null);
}

function pnlNum(t: Trade) {
  return parseFloat(t.pnl!);
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

function winRate(trades: Trade[]) {
  const c = closedTrades(trades);
  if (!c.length) return 0;
  return (c.filter((t) => t.result === "win").length / c.length) * 100;
}

function totalPnl(trades: Trade[]) {
  return closedTrades(trades).reduce((s, t) => s + pnlNum(t), 0);
}

// ── SVG bar chart helpers ─────────────────────────────────────────────────────

const BAR_H = 180;
const BAR_PAD = { top: 12, right: 8, bottom: 28, left: 56 };

function BarChart({
  bars,
  formatY = (v: number) => v.toFixed(0),
  colorFn = (v: number) => (v >= 0 ? "#2fac66" : "#f06060"),
  emptyLabel,
}: {
  bars: { label: string; value: number }[];
  formatY?: (v: number) => string;
  colorFn?: (v: number) => string;
  emptyLabel: string;
}) {
  if (!bars.length) return <EmptyChart label={emptyLabel} />;

  const W = Math.max(bars.length * 52, 300);
  const chartW = W - BAR_PAD.left - BAR_PAD.right;
  const chartH = BAR_H - BAR_PAD.top - BAR_PAD.bottom;

  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)), 0.01);
  const hasNeg = bars.some((b) => b.value < 0);
  const zeroY = hasNeg
    ? BAR_PAD.top + (maxAbs / (2 * maxAbs)) * chartH
    : BAR_PAD.top + chartH;

  const barW = Math.max(chartW / bars.length - 4, 8);

  return (
    <svg
      viewBox={`0 0 ${W} ${BAR_H}`}
      width="100%"
      height={BAR_H}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1={BAR_PAD.left}
        x2={W - BAR_PAD.right}
        y1={zeroY}
        y2={zeroY}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {bars.map((bar, i) => {
        const x = BAR_PAD.left + (i / bars.length) * chartW + (chartW / bars.length - barW) / 2;
        const ratio = Math.abs(bar.value) / maxAbs;
        const barHeight = ratio * (hasNeg ? chartH / 2 : chartH);
        const y = bar.value >= 0 ? zeroY - barHeight : zeroY;
        return (
          <g key={bar.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barHeight, 1)}
              fill={colorFn(bar.value)}
              opacity="0.85"
            />
            <text
              x={x + barW / 2}
              y={BAR_H - 4}
              textAnchor="middle"
              fontSize="7"
              fontFamily="var(--font-ibm-plex-mono)"
              fill="rgba(156,163,175,0.8)"
            >
              {bar.label.length > 6 ? bar.label.slice(0, 6) : bar.label}
            </text>
          </g>
        );
      })}

      {[maxAbs, 0, hasNeg ? -maxAbs : null]
        .filter((v): v is number => v !== null)
        .map((v, i) => (
          <text
            key={v}
            x={BAR_PAD.left - 4}
            y={
              i === 0
                ? BAR_PAD.top + 4
                : i === 1
                ? zeroY + 4
                : BAR_PAD.top + chartH + 4
            }
            textAnchor="end"
            fontSize="7"
            fontFamily="var(--font-ibm-plex-mono)"
            fill="rgba(156,163,175,0.8)"
          >
            {formatY(v)}
          </text>
        ))}
    </svg>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  color,
  sub,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  sub?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-[6px]">
      <span className="font-mono text-[10px] text-secondary w-20 flex-shrink-0 text-right truncate">
        {label}
      </span>
      <div className="flex-1 h-[8px] bg-white/[0.06] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px] text-primary w-14 flex-shrink-0">
        {sub ?? value.toFixed(1)}
      </span>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[100px]">
      <p className="font-mono text-[11px] text-muted">{label}</p>
    </div>
  );
}

function ChartCard({
  title,
  loading,
  children,
  action,
}: {
  title: string;
  loading: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {title}
        </p>
        {action}
      </div>
      {loading ? (
        <div className="skeleton w-full rounded-sm" style={{ height: BAR_H }} />
      ) : (
        children
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const tJournal = useTranslations("journal");

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [pnlGrouping, setPnlGrouping] = useState<"week" | "month">("month");

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<PaginatedTrades>(
        "/api/trades/?ordering=entry_time&page_size=1000"
      );
      setTrades(res.results);
    } catch {
      // Silently ignore — empty state shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const closed = closedTrades(trades);

  const EMOTION_LABELS: Record<string, string> = {
    calm: tJournal("emotions.calm"),
    confident: tJournal("emotions.confident"),
    fearful: tJournal("emotions.fearful"),
    greedy: tJournal("emotions.greedy"),
    anxious: tJournal("emotions.anxious"),
    fomo: "FOMO",
    revenge: "Revenge",
    neutral: tJournal("emotions.neutral"),
  };

  // ── P&L breakdown ──────────────────────────────────────────────────────────

  const pnlBars = (() => {
    const groups = groupBy(closed, (t) => {
      const d = new Date(t.entry_time);
      if (pnlGrouping === "week") {
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil(
          ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        return `W${week}`;
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-16)
      .map(([label, ts]) => ({
        label: pnlGrouping === "week" ? label : label.slice(5),
        value: ts.reduce((s, t) => s + pnlNum(t), 0),
      }));
  })();

  // ── Win/Loss by asset ──────────────────────────────────────────────────────

  const assetBars = (() => {
    const groups = groupBy(closed, (t) => t.pair);
    return Object.entries(groups)
      .map(([pair, ts]) => ({
        label: pair,
        winRate: winRate(ts),
        totalPnl: totalPnl(ts),
        count: ts.length,
      }))
      .sort((a, b) => b.totalPnl - a.totalPnl)
      .slice(0, 8);
  })();

  const assetPnlMax = Math.max(...assetBars.map((a) => Math.abs(a.totalPnl)), 0.01);

  // ── Win/Loss by emotion ────────────────────────────────────────────────────

  const emotionBars = (() => {
    const tradesWithEmotion = closed.filter((t) => t.emotion);
    const groups = groupBy(tradesWithEmotion, (t) => t.emotion!);
    return Object.entries(groups)
      .map(([emotion, ts]) => ({
        label: EMOTION_LABELS[emotion] ?? emotion,
        winRate: winRate(ts),
        count: ts.length,
      }))
      .sort((a, b) => b.winRate - a.winRate);
  })();

  const emotionWrMax = Math.max(...emotionBars.map((e) => e.winRate), 0.01);

  // ── Win/Loss by time of day ────────────────────────────────────────────────

  const hourBins = [
    { label: "00-06", range: [0, 6] },
    { label: "06-09", range: [6, 9] },
    { label: "09-12", range: [9, 12] },
    { label: "12-15", range: [12, 15] },
    { label: "15-18", range: [15, 18] },
    { label: "18-21", range: [18, 21] },
    { label: "21-24", range: [21, 24] },
  ];

  const timeBars = hourBins.map(({ label, range }) => {
    const inBin = closed.filter((t) => {
      const h = new Date(t.entry_time).getHours();
      return h >= range[0] && h < range[1];
    });
    return { label, value: winRate(inBin), count: inBin.length };
  });

  // ── Win/Loss by direction ──────────────────────────────────────────────────

  const longTrades = closed.filter((t) => t.direction === "long");
  const shortTrades = closed.filter((t) => t.direction === "short");

  // ── Drawdown ──────────────────────────────────────────────────────────────

  const drawdownBars = (() => {
    if (!closed.length) return [];
    let cum = 0;
    let peak = 0;
    return closed.map((t, i) => {
      cum += pnlNum(t);
      if (cum > peak) peak = cum;
      return {
        label: String(i + 1),
        value: cum - peak,
      };
    });
  })();

  // ── Stat cards ─────────────────────────────────────────────────────────────

  const totalPnlVal = totalPnl(trades);
  const wr = winRate(trades);
  const wins = closed.filter((t) => t.result === "win").length;
  const losses = closed.filter((t) => t.result === "loss").length;

  const noData = t("noData");

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      <div>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
          {t("title")}
        </h1>
        <p className="font-mono text-[11px] text-muted mt-[3px]">
          {t("subtitle", { count: trades.length })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: t("statPnl"),
            value: loading ? "—" : formatPnl(totalPnlVal),
            color: !loading && totalPnlVal > 0 ? "text-profit" : !loading && totalPnlVal < 0 ? "text-loss" : "text-primary",
          },
          {
            label: t("statWinRate"),
            value: loading ? "—" : formatPct(wr),
            color: !loading && wr >= 50 ? "text-profit" : !loading ? "text-loss" : "text-primary",
            sub: loading ? undefined : `${wins}W / ${losses}L`,
          },
          {
            label: t("statTrades"),
            value: loading ? "—" : String(trades.length),
            color: "text-primary",
          },
          {
            label: t("statBestDay"),
            value: loading ? "—" : (() => {
              if (!closed.length) return "—";
              const byDay = groupBy(closed, (t) => t.entry_time.slice(0, 10));
              const best = Object.entries(byDay).sort(
                ([, a], [, b]) => totalPnl(b) - totalPnl(a)
              )[0];
              return best ? formatPnl(totalPnl(best[1])) : "—";
            })(),
            color: "text-primary",
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card p-4">
            {loading ? (
              <>
                <div className="skeleton h-2 w-16 rounded-sm mb-3" />
                <div className="skeleton h-5 w-24 rounded-sm" />
              </>
            ) : (
              <>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">
                  {label}
                </p>
                <p className={`font-mono text-[20px] tabular-nums font-semibold ${color}`}>
                  {value}
                </p>
                {sub && (
                  <p className="font-mono text-[10px] text-muted mt-1">{sub}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* P&L Breakdown */}
      <ChartCard
        title={t("chartPnlPeriod")}
        loading={loading}
        action={
          <div className="flex gap-[2px] bg-base border border-white/[0.08] overflow-hidden">
            {(["week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPnlGrouping(v)}
                className={`font-mono text-[9px] px-3 py-[5px] transition-colors ${
                  pnlGrouping === v ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
                }`}
              >
                {v === "week" ? t("periodWeek") : t("periodMonth")}
              </button>
            ))}
          </div>
        }
      >
        <BarChart
          bars={pnlBars}
          formatY={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}€`}
          emptyLabel={noData}
        />
      </ChartCard>

      {/* Two-column row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Win/Loss by asset */}
        <ChartCard title={t("chartPnlAsset")} loading={loading}>
          {assetBars.length === 0 ? (
            <EmptyChart label={noData} />
          ) : (
            <div className="space-y-1">
              {assetBars.map((a) => (
                <HorizontalBar
                  key={a.label}
                  label={a.label}
                  value={Math.abs(a.totalPnl)}
                  max={assetPnlMax}
                  color={a.totalPnl >= 0 ? "#2fac66" : "#f06060"}
                  sub={formatPnl(a.totalPnl)}
                />
              ))}
            </div>
          )}
        </ChartCard>

        {/* Win/Loss by emotion */}
        <ChartCard title={t("chartWrEmotion")} loading={loading}>
          {emotionBars.length === 0 ? (
            <EmptyChart label={noData} />
          ) : (
            <div className="space-y-1">
              {emotionBars.map((e) => (
                <HorizontalBar
                  key={e.label}
                  label={e.label}
                  value={e.winRate}
                  max={emotionWrMax}
                  color={e.winRate >= 50 ? "#2fac66" : "#f06060"}
                  sub={`${e.winRate.toFixed(0)}% (${e.count})`}
                />
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Two-column row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Win/Loss by time of day */}
        <ChartCard title={t("chartWrTime")} loading={loading}>
          <BarChart
            bars={timeBars.filter((b) => b.count > 0).map((b) => ({
              label: b.label,
              value: b.value,
            }))}
            formatY={(v) => `${v.toFixed(0)}%`}
            colorFn={(v) => (v >= 50 ? "#2fac66" : "#f06060")}
            emptyLabel={noData}
          />
        </ChartCard>

        {/* Win/Loss by direction */}
        <ChartCard title={t("chartLongShort")} loading={loading}>
          {!longTrades.length && !shortTrades.length ? (
            <EmptyChart label={noData} />
          ) : (
            <div className="space-y-4 py-2">
              {[
                { label: "Long", trades: longTrades, color: "#2fac66" },
                { label: "Short", trades: shortTrades, color: "#f06060" },
              ].map(({ label, trades: dt, color }) => {
                const wr = winRate(dt);
                const pl = totalPnl(dt);
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-secondary">{label}</span>
                      <span className="font-mono text-[10px] text-muted">
                        {dt.length} {t("tradesOps")} · {formatPnl(pl)}
                      </span>
                    </div>
                    <div className="h-[10px] bg-white/[0.06] rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{ width: `${wr}%`, background: color }}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-muted">
                      {t("winRateLabel")} {wr.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Drawdown */}
      <ChartCard title={t("chartDrawdown")} loading={loading}>
        <BarChart
          bars={drawdownBars.slice(-30)}
          formatY={(v) => `${v.toFixed(0)}€`}
          colorFn={() => "#f06060"}
          emptyLabel={noData}
        />
      </ChartCard>
    </div>
  );
}

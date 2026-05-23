"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  AreaChart,
  Area,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { get } from "@/lib/api";
import { formatPnl, formatPct } from "@/lib/format";
import ChartTooltip, { type ChartEntry } from "@/components/charts/ChartTooltip";
import type { Trade, PaginatedTrades } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthShort(month0: number, locale: string): string {
  return new Date(2024, month0, 1).toLocaleDateString(
    locale === "en" ? "en-US" : "es-ES",
    { month: "short" }
  );
}

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

function getMondayKey(d: Date): string {
  const m = new Date(d);
  m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return m.toISOString().slice(0, 10);
}

function shortPnl(v: number): string {
  return v >= 0
    ? `+€${Math.abs(v).toFixed(0)}`
    : `−€${Math.abs(v).toFixed(0)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
        <div className="skeleton w-full rounded-sm" style={{ height: 180 }} />
      ) : (
        children
      )}
    </div>
  );
}

// ── Axis / tick styles ────────────────────────────────────────────────────────

const TICK_STYLE = {
  fill: "#9ca3af",
  fontSize: 11,
  fontFamily: "IBM Plex Mono",
} as const;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const tJournal = useTranslations("journal");
  const locale = useLocale();

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
      // Empty state shown
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
    if (pnlGrouping === "week") {
      const groups = groupBy(closed, (t) => getMondayKey(new Date(t.entry_time)));
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([key, ts]) => {
          const [, m, d] = key.split("-").map(Number);
          const value = parseFloat(ts.reduce((s, t) => s + pnlNum(t), 0).toFixed(2));
          return {
            label: `${d} ${getMonthShort(m - 1, locale)}`,
            value,
            count: ts.length,
          };
        });
    }
    const groups = groupBy(closed, (t) => t.entry_time.slice(0, 7));
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ts]) => {
        const [y, m] = key.split("-").map(Number);
        const value = parseFloat(ts.reduce((s, t) => s + pnlNum(t), 0).toFixed(2));
        return {
          label: `${getMonthShort(m - 1, locale)} ${String(y).slice(2)}`,
          value,
          count: ts.length,
        };
      });
  })();

  // ── Asset PnL ──────────────────────────────────────────────────────────────

  const assetChartData = (() => {
    const groups = groupBy(closed, (t) => t.pair);
    return Object.entries(groups)
      .map(([pair, ts]) => ({
        asset: pair,
        pnl: parseFloat(totalPnl(ts).toFixed(2)),
        count: ts.length,
        displayLabel: shortPnl(totalPnl(ts)),
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 8);
  })();

  // ── Emotion win rate ───────────────────────────────────────────────────────

  const emotionChartData = (() => {
    const tradesWithEmotion = closed.filter((t) => t.emotion);
    const groups = groupBy(tradesWithEmotion, (t) => t.emotion!);
    return Object.entries(groups)
      .map(([emotion, ts]) => {
        const wr = winRate(ts);
        return {
          emotion: EMOTION_LABELS[emotion] ?? emotion,
          winRate: parseFloat(wr.toFixed(1)),
          count: ts.length,
          displayLabel: `${wr.toFixed(0)}% (${ts.length})`,
        };
      })
      .sort((a, b) => b.winRate - a.winRate);
  })();

  // ── Time of day win rate ───────────────────────────────────────────────────

  const overallWr = winRate(closed);

  const timeBars = [
    { label: "00-06", range: [0, 6] },
    { label: "06-09", range: [6, 9] },
    { label: "09-12", range: [9, 12] },
    { label: "12-15", range: [12, 15] },
    { label: "15-18", range: [15, 18] },
    { label: "18-21", range: [18, 21] },
    { label: "21-24", range: [21, 24] },
  ]
    .map(({ label, range }) => {
      const inBin = closed.filter((t) => {
        const h = new Date(t.entry_time).getHours();
        return h >= range[0] && h < range[1];
      });
      return { label, winRate: winRate(inBin), count: inBin.length };
    })
    .filter((b) => b.count > 0);

  // ── Long/Short ─────────────────────────────────────────────────────────────

  const longTrades = closed.filter((t) => t.direction === "long");
  const shortTrades = closed.filter((t) => t.direction === "short");

  // ── Drawdown ───────────────────────────────────────────────────────────────

  const drawdownPoints = (() => {
    if (!closed.length) return [];
    const byDay = groupBy(closed, (t) => t.entry_time.slice(0, 10));
    const sortedDays = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
    let cum = 0;
    let peak = 0;
    return sortedDays.map(([date, ts]) => {
      cum += ts.reduce((s, t) => s + pnlNum(t), 0);
      if (cum > peak) peak = cum;
      return { date, value: cum - peak };
    });
  })();

  const maxDrawdownPoint =
    drawdownPoints.length > 0
      ? drawdownPoints.reduce(
          (min, p) => (p.value < min.value ? p : min),
          drawdownPoints[0]
        )
      : null;

  const drawdownXTicks = (() => {
    if (!drawdownPoints.length) return [];
    const count = Math.min(8, drawdownPoints.length);
    const seen = new Set<string>();
    return Array.from({ length: count }, (_, i) =>
      Math.round((i * (drawdownPoints.length - 1)) / Math.max(count - 1, 1))
    )
      .map((i) => drawdownPoints[i].date)
      .filter((date) => {
        const mk = date.slice(0, 7);
        if (seen.has(mk)) return false;
        seen.add(mk);
        return true;
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
            color:
              !loading && totalPnlVal > 0
                ? "text-profit"
                : !loading && totalPnlVal < 0
                ? "text-loss"
                : "text-primary",
          },
          {
            label: t("statWinRate"),
            value: loading ? "—" : formatPct(wr),
            color:
              !loading && wr >= 50
                ? "text-profit"
                : !loading
                ? "text-loss"
                : "text-primary",
            sub: loading ? undefined : `${wins}W / ${losses}L`,
          },
          {
            label: t("statTrades"),
            value: loading ? "—" : String(trades.length),
            color: "text-primary",
          },
          {
            label: t("statBestDay"),
            value: loading
              ? "—"
              : (() => {
                  if (!closed.length) return "—";
                  const byDay = groupBy(
                    closed,
                    (t) => t.entry_time.slice(0, 10)
                  );
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

      {/* ── A: P&L por Período ── */}
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
                  pnlGrouping === v
                    ? "bg-elevated text-primary"
                    : "text-muted hover:text-secondary"
                }`}
              >
                {v === "week" ? t("periodWeek") : t("periodMonth")}
              </button>
            ))}
          </div>
        }
      >
        {pnlBars.length === 0 ? (
          <EmptyChart label={noData} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={pnlBars}
              {...(pnlBars.length < 5
                ? { barSize: 80 }
                : { barCategoryGap: "30%" })}
              margin={{ top: 24, right: 8, bottom: 5, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={(props: TooltipContentProps) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload as unknown as ChartEntry[]}
                    label={props.label !== undefined ? String(props.label) : undefined}
                    formatValue={formatPnl}
                  />
                )}
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} animationDuration={600}>
                {pnlBars.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value >= 0 ? "#2fac66" : "#f06060"}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="center"
                  formatter={(v: string | number | boolean | null | undefined) =>
                    typeof v === "number" ? shortPnl(v) : ""
                  }
                  style={{
                    fontFamily: "IBM Plex Mono",
                    fontSize: 13,
                    fontWeight: 600,
                    fill: "#ffffff",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Two-column row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* ── B: P&L por Activo ── */}
        <ChartCard title={t("chartPnlAsset")} loading={loading}>
          {assetChartData.length === 0 ? (
            <EmptyChart label={noData} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={assetChartData}
                layout="vertical"
                margin={{ top: 5, right: 80, bottom: 5, left: 0 }}
                barCategoryGap="15%"
              >
                <YAxis
                  type="category"
                  dataKey="asset"
                  width={90}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <XAxis type="number" hide />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={(props: TooltipContentProps) => (
                    <ChartTooltip
                      active={props.active}
                      payload={props.payload as unknown as ChartEntry[]}
                      label={props.label !== undefined ? String(props.label) : undefined}
                      formatValue={formatPnl}
                    />
                  )}
                />
                <Bar dataKey="pnl" radius={[0, 2, 2, 0]} animationDuration={600}>
                  {assetChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.pnl >= 0 ? "#2fac66" : "#f06060"}
                    />
                  ))}
                  <LabelList
                    dataKey="displayLabel"
                    position="right"
                    style={{
                      fontFamily: "IBM Plex Mono",
                      fontSize: 12,
                      fill: "#9ca3af",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── C: Win Rate por Emoción ── */}
        <ChartCard title={t("chartWrEmotion")} loading={loading}>
          {emotionChartData.length === 0 ? (
            <EmptyChart label={noData} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={emotionChartData}
                layout="vertical"
                margin={{ top: 5, right: 90, bottom: 5, left: 0 }}
                barCategoryGap="15%"
              >
                <YAxis
                  type="category"
                  dataKey="emotion"
                  width={90}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <XAxis type="number" domain={[0, 100]} hide />
                <ReferenceLine
                  x={50}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4 4"
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={(props: TooltipContentProps) => (
                    <ChartTooltip
                      active={props.active}
                      payload={props.payload as unknown as ChartEntry[]}
                      label={props.label !== undefined ? String(props.label) : undefined}
                      formatValue={(v) => `${v.toFixed(1)}%`}
                      getColor={(v) => (v > 50 ? "#2fac66" : "#f06060")}
                    />
                  )}
                />
                <Bar
                  dataKey="winRate"
                  radius={[0, 2, 2, 0]}
                  animationDuration={600}
                >
                  {emotionChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.winRate > 50 ? "#2fac66" : "#f06060"}
                    />
                  ))}
                  <LabelList
                    dataKey="displayLabel"
                    position="right"
                    style={{
                      fontFamily: "IBM Plex Mono",
                      fontSize: 11,
                      fill: "#9ca3af",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Two-column row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* ── D: Win Rate por Hora ── */}
        <ChartCard title={t("chartWrTime")} loading={loading}>
          {timeBars.length === 0 ? (
            <EmptyChart label={noData} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={timeBars}
                barCategoryGap="30%"
                margin={{ top: 20, right: 8, bottom: 5, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <ReferenceLine
                  y={overallWr}
                  stroke="#2fac66"
                  strokeDasharray="4 4"
                  label={{
                    value: locale === "en" ? "Your avg" : "Tu media",
                    fill: "#9ca3af",
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    position: "right",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={(props: TooltipContentProps) => (
                    <ChartTooltip
                      active={props.active}
                      payload={props.payload as unknown as ChartEntry[]}
                      label={props.label !== undefined ? String(props.label) : undefined}
                      formatValue={(v) => `${v.toFixed(1)}%`}
                      getColor={(v) =>
                        v >= overallWr ? "#2fac66" : "#f06060"
                      }
                    />
                  )}
                />
                <Bar
                  dataKey="winRate"
                  radius={[2, 2, 0, 0]}
                  animationDuration={600}
                >
                  {timeBars.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.winRate >= overallWr ? "#2fac66" : "#f06060"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Win/Loss by direction — CSS bars (unchanged) */}
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
                      <span className="font-mono text-[10px] text-secondary">
                        {label}
                      </span>
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

      {/* ── E: Drawdown Acumulado ── */}
      <ChartCard title={t("chartDrawdown")} loading={loading}>
        {drawdownPoints.length === 0 ? (
          <EmptyChart label={noData} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={drawdownPoints}
              margin={{ top: 30, right: 16, bottom: 40, left: 0 }}
            >
              <defs>
                <linearGradient id="dd-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f06060" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f06060" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <ReferenceLine
                y={0}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="date"
                ticks={drawdownXTicks}
                tickFormatter={(date: string) => {
                  const [, m] = date.split("-").map(Number);
                  return getMonthShort(m - 1, locale);
                }}
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={52}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v === 0 ? "€0" : `-€${Math.abs(v).toFixed(0)}`
                }
                tick={{
                  fill: "rgba(156,163,175,0.8)",
                  fontSize: 8,
                  fontFamily: "var(--font-ibm-plex-mono)",
                }}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                content={(props: TooltipContentProps) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload as unknown as ChartEntry[]}
                    label={props.label !== undefined ? String(props.label) : undefined}
                    formatValue={(v) =>
                      v === 0 ? "€0" : `−€${Math.abs(v).toFixed(0)}`
                    }
                    formatLabel={(l) => {
                      const [y, m, d] = l.split("-").map(Number);
                      return new Date(y, m - 1, d).toLocaleDateString(
                        locale === "en" ? "en-US" : "es-ES",
                        { day: "numeric", month: "long", year: "numeric" }
                      );
                    }}
                    getColor={() => "#f06060"}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f06060"
                strokeWidth={1.5}
                fill="url(#dd-grad)"
                dot={false}
                activeDot={{ r: 4, fill: "#f06060" }}
                animationDuration={600}
              />
              {maxDrawdownPoint && (
                <ReferenceDot
                  x={maxDrawdownPoint.date}
                  y={maxDrawdownPoint.value}
                  r={5}
                  fill="#ffffff"
                  stroke="#f06060"
                  strokeWidth={2}
                  label={{
                    value: t("maxDrawdown", { value: Math.abs(maxDrawdownPoint.value).toFixed(0) }),
                    position: "top",
                    dy: -10,
                    fill: "#f06060",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono",
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
}

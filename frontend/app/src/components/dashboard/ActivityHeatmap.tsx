"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { HeatmapDay } from "@/types";

const WEEKS = 26;
const CELL = 12;
const GAP = 2;
const DAY_LABEL_W = 14;

const DOW_NAMES_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface TooltipState {
  day: HeatmapDay;
  x: number;
  y: number;
}

function heatColor(pnl: number, maxAbs: number): string {
  const ratio = maxAbs > 0 ? Math.min(Math.abs(pnl) / maxAbs, 1) : 0;
  const opacity = ratio < 0.33 ? 0.3 : ratio < 0.67 ? 0.6 : 1.0;
  return pnl >= 0
    ? `rgba(47,172,102,${opacity})`
    : `rgba(240,96,96,${opacity})`;
}

function formatTooltipDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    locale === "en" ? "en-US" : "es-ES",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

function formatCellPnl(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}€`;
}

function getMonthShort(month0: number, locale: string): string {
  return new Date(2024, month0, 1).toLocaleDateString(
    locale === "en" ? "en-US" : "es-ES",
    { month: "short" }
  );
}

function formatDayStat(day: HeatmapDay): string {
  const sign = day.pnl >= 0 ? "+" : "−";
  const abs = Math.abs(day.pnl).toFixed(0);
  const [y, m, d] = day.date.split("-").map(Number);
  const dateStr = new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  return `${sign}€${abs} · ${dateStr}`;
}

interface Props {
  data: HeatmapDay[];
  loading?: boolean;
}

export default function ActivityHeatmap({ data, loading }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tJournal = useTranslations("journal");

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const DAYS =
    locale === "en"
      ? ["M", "T", "W", "T", "F", "S", "S"]
      : ["L", "M", "X", "J", "V", "S", "D"];

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

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-24 mb-4 rounded-sm" />
        <div className="skeleton w-full h-[120px] rounded-sm" />
      </div>
    );
  }

  // ── Stats computation ──────────────────────────────────────────────────────

  const tradingDays = data.filter((d) => d.tradeCount > 0);
  const tradingDaysCount = tradingDays.length;

  const bestDay =
    tradingDays.length > 0
      ? tradingDays.reduce((best, d) => (d.pnl > best.pnl ? d : best), tradingDays[0])
      : null;

  const worstDay =
    tradingDays.length > 0
      ? tradingDays.reduce((worst, d) => (d.pnl < worst.pnl ? d : worst), tradingDays[0])
      : null;

  const sorted = [...tradingDays].sort((a, b) => a.date.localeCompare(b.date));
  let bestStreak = 0, worstStreak = 0, curWin = 0, curLoss = 0;
  for (const d of sorted) {
    if (d.pnl > 0) {
      curWin++;
      if (curWin > bestStreak) bestStreak = curWin;
      curLoss = 0;
    } else if (d.pnl < 0) {
      curLoss++;
      if (curLoss > worstStreak) worstStreak = curLoss;
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
  }

  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of tradingDays) {
    const [y, m, day] = d.date.split("-").map(Number);
    const dow = (new Date(y, m - 1, day).getDay() + 6) % 7;
    dowCounts[dow] += d.tradeCount;
  }
  const maxDowIdx = dowCounts.indexOf(Math.max(...dowCounts));
  const mostActiveDow = tradingDays.length > 0 ? DOW_NAMES_ES[maxDowIdx] : null;

  // ── Grid construction ──────────────────────────────────────────────────────

  const byDate = new Map<string, HeatmapDay>();
  for (const d of data) byDate.set(d.date, d);

  const maxAbs =
    data.length > 0 ? Math.max(...data.map((d) => Math.abs(d.pnl)), 0.01) : 0.01;

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayDow = (today.getDay() + 6) % 7;
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - todayDow));

  const weeks: string[][] = [];
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let prevMonth = -1;

  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(gridEnd);
      cellDate.setDate(gridEnd.getDate() - w * 7 - (6 - d));
      const iso = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
      week.push(iso);
    }
    const weekIndex = WEEKS - 1 - w;
    const mondayDate = new Date(gridEnd);
    mondayDate.setDate(gridEnd.getDate() - w * 7 - 6);
    const month = mondayDate.getMonth();
    if (month !== prevMonth) {
      monthLabels.push({ weekIndex, label: getMonthShort(month, locale) });
      prevMonth = month;
    }
    weeks.push(week);
  }

  const gridWidth = WEEKS * (CELL + GAP) - GAP;

  const statRow = (
    label: string,
    value: string | null,
    color: string = "#e8ebe8"
  ) => (
    <div
      key={label}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-ibm-plex-sans)",
          fontSize: 13,
          color: "#9ca3af",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-ibm-plex-mono)",
          fontSize: 13,
          color,
          textAlign: "right",
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-3">
        {t("heatmapTitle")}
      </p>

      <div className="flex gap-6 items-start">
        {/* Left: heatmap grid + legend */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto">
            <div style={{ minWidth: DAY_LABEL_W + 4 + gridWidth }}>
              {/* Month labels row */}
              <div
                style={{
                  marginLeft: DAY_LABEL_W + 4,
                  position: "relative",
                  height: 16,
                  width: gridWidth,
                  marginBottom: 4,
                }}
              >
                {monthLabels.map(({ weekIndex, label }) => (
                  <span
                    key={`${label}-${weekIndex}`}
                    className="font-mono text-[9px] text-muted absolute"
                    style={{ left: weekIndex * (CELL + GAP) }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Day labels + cell grid */}
              <div style={{ display: "flex", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: GAP,
                    width: DAY_LABEL_W,
                    flexShrink: 0,
                  }}
                >
                  {DAYS.map((label, i) => (
                    <div
                      key={`${label}-${i}`}
                      className="font-mono text-muted flex items-center justify-end"
                      style={{
                        height: CELL,
                        fontSize: 8,
                        opacity: i % 2 === 0 ? 1 : 0,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: GAP }}>
                  {weeks.map((week, wi) => (
                    <div
                      key={wi}
                      style={{ display: "flex", flexDirection: "column", gap: GAP }}
                    >
                      {week.map((iso) => {
                        const hit = byDate.get(iso);
                        const hasData = !!hit && hit.tradeCount > 0;
                        const isToday = iso === todayISO;

                        return (
                          <div
                            key={iso}
                            title={iso}
                            onClick={() => {
                              if (hasData) router.push(`/journal?date=${iso}`);
                            }}
                            onMouseEnter={(e) => {
                              if (!hit) return;
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({
                                day: hit,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            style={{
                              width: CELL,
                              height: CELL,
                              borderRadius: 2,
                              flexShrink: 0,
                              cursor: hasData ? "pointer" : "default",
                              backgroundColor: hasData
                                ? heatColor(hit.pnl, maxAbs)
                                : "var(--surface)",
                              border: isToday
                                ? "1px solid var(--text-secondary)"
                                : "1px solid var(--border)",
                              boxSizing: "border-box",
                              transition: "opacity 0.15s",
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
            <div className="flex items-center gap-[3px]">
              <span className="font-mono text-[8px] text-muted mr-1">
                {t("heatmapLessLabel")}
              </span>
              {[0.3, 0.5, 0.7, 0.85, 1.0].map((o) => (
                <div
                  key={o}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: `rgba(47,172,102,${o})`,
                    flexShrink: 0,
                  }}
                />
              ))}
              <span className="font-mono text-[8px] text-muted ml-1">
                {t("heatmapMoreLabel")}
              </span>
            </div>
            <div className="flex items-center gap-[3px]">
              <span className="font-mono text-[8px] text-muted mr-1">
                {t("heatmapLessLabel")}
              </span>
              {[0.3, 0.5, 0.7, 0.85, 1.0].map((o) => (
                <div
                  key={o}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: `rgba(240,96,96,${o})`,
                    flexShrink: 0,
                  }}
                />
              ))}
              <span className="font-mono text-[8px] text-muted ml-1">
                {t("heatmapMoreLabel")}
              </span>
            </div>
          </div>
        </div>

        {/* Right: stats panel — hidden on mobile */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: "35%" }}>
          <p
            style={{
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 10,
              color: "#9ca3af",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            RESUMEN
          </p>

          {tradingDaysCount === 0 ? (
            <p className="font-mono text-[11px] text-muted">—</p>
          ) : (
            <>
              {statRow("Días operados", String(tradingDaysCount))}
              {statRow(
                "Mejor día",
                bestDay ? formatDayStat(bestDay) : null,
                "#2fac66"
              )}
              {statRow(
                "Peor día",
                worstDay ? formatDayStat(worstDay) : null,
                "#f06060"
              )}
              {statRow(
                "Racha ganadora",
                bestStreak > 0 ? `${bestStreak} días` : "—",
                "#2fac66"
              )}
              {statRow(
                "Racha perdedora",
                worstStreak > 0 ? `${worstStreak} días` : "—",
                "#f06060"
              )}
              {statRow(
                "Día más activo",
                mostActiveDow,
              )}
            </>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: Math.max(
              8,
              Math.min(
                tooltip.x - 104,
                (typeof window !== "undefined" ? window.innerWidth : 1200) - 216
              )
            ),
            top: tooltip.y,
            transform: "translateY(calc(-100% - 10px))",
          }}
        >
          <div
            className="w-52 p-3 shadow-xl"
            style={{
              backgroundColor: "var(--elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="font-mono text-[9px] text-muted mb-2 capitalize leading-tight">
              {formatTooltipDate(tooltip.day.date, locale)}
            </p>
            <p
              className={`font-mono text-[14px] font-semibold mb-[6px] ${
                tooltip.day.pnl >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {formatCellPnl(tooltip.day.pnl)}
            </p>
            <p className="font-mono text-[10px] text-secondary mb-2">
              {tooltip.day.tradeCount === 1
                ? tJournal("tradeCountSingle")
                : tJournal("tradeCountPlural", { count: tooltip.day.tradeCount })}
            </p>
            {tooltip.day.bestTrade && (
              <div className="flex items-center gap-1 mb-[6px]">
                <span className="font-mono text-[9px] text-muted">Mejor:</span>
                <span className="font-mono text-[9px] text-secondary font-semibold">
                  {tooltip.day.bestTrade.pair}
                </span>
                <span
                  className={`font-mono text-[9px] ml-auto ${
                    tooltip.day.bestTrade.pnl >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {formatCellPnl(tooltip.day.bestTrade.pnl)}
                </span>
              </div>
            )}
            {tooltip.day.emotions &&
              Object.keys(tooltip.day.emotions).length > 0 && (
                <p className="font-mono text-[9px] text-muted leading-relaxed">
                  {Object.entries(tooltip.day.emotions)
                    .map(
                      ([e, c]) =>
                        `${EMOTION_LABELS[e] ?? e}${c > 1 ? ` ×${c}` : ""}`
                    )
                    .join(" · ")}
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

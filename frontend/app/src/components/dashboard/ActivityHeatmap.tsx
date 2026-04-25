"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HeatmapDay } from "@/types";

const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const EMOTION_ES: Record<string, string> = {
  calm: "Tranquilo", confident: "Confiado", fearful: "Incierto",
  greedy: "Codicioso", anxious: "Ansioso", fomo: "FOMO",
  revenge: "Revenge", neutral: "Neutral",
};

const WEEKS = 52;
const CELL = 12;
const GAP = 2;
const DAY_LABEL_W = 14;

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

function formatTooltipDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatPnl(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}€`;
}

interface Props {
  data: HeatmapDay[];
  loading?: boolean;
}

export default function ActivityHeatmap({ data, loading }: Props) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-24 mb-4 rounded-sm" />
        <div className="skeleton w-full h-[120px] rounded-sm" />
      </div>
    );
  }

  const byDate = new Map<string, HeatmapDay>();
  for (const d of data) byDate.set(d.date, d);

  const maxAbs = data.length > 0 ? Math.max(...data.map((d) => Math.abs(d.pnl)), 0.01) : 0.01;

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayDow = (today.getDay() + 6) % 7; // 0=Mon
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - todayDow)); // Sunday of current week

  // Build weeks array (oldest → newest)
  const weeks: string[][] = []; // weeks[weekIdx][dayIdx] = ISO date
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
      monthLabels.push({ weekIndex, label: MONTHS_ES[month] });
      prevMonth = month;
    }
    weeks.push(week);
  }

  const gridWidth = WEEKS * (CELL + GAP) - GAP;

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-3">
        Actividad · 52 semanas
      </p>

      <div className="overflow-x-auto">
        <div style={{ minWidth: DAY_LABEL_W + 4 + gridWidth }}>

          {/* Month labels row */}
          <div style={{ marginLeft: DAY_LABEL_W + 4, position: "relative", height: 16, width: gridWidth, marginBottom: 4 }}>
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

          {/* Day labels + grid */}
          <div style={{ display: "flex", gap: 4 }}>
            {/* Day labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: GAP, width: DAY_LABEL_W, flexShrink: 0 }}>
              {DAYS_ES.map((label, i) => (
                <div
                  key={label}
                  className="font-mono text-muted flex items-center justify-end"
                  style={{
                    height: CELL,
                    fontSize: 8,
                    opacity: i % 2 === 0 ? 1 : 0, // show alternating to avoid crowding
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cell grid */}
            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
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
                          setTooltip({ day: hit, x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          flexShrink: 0,
                          cursor: hasData ? "pointer" : "default",
                          backgroundColor: hasData ? heatColor(hit.pnl, maxAbs) : "var(--surface)",
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
          <span className="font-mono text-[8px] text-muted mr-1">Menos</span>
          {[0.3, 0.5, 0.7, 0.85, 1.0].map((o) => (
            <div key={o} style={{ width: CELL, height: CELL, borderRadius: 2, background: `rgba(47,172,102,${o})`, flexShrink: 0 }} />
          ))}
          <span className="font-mono text-[8px] text-muted ml-1">Más</span>
        </div>
        <div className="flex items-center gap-[3px]">
          <span className="font-mono text-[8px] text-muted mr-1">Menos</span>
          {[0.3, 0.5, 0.7, 0.85, 1.0].map((o) => (
            <div key={o} style={{ width: CELL, height: CELL, borderRadius: 2, background: `rgba(240,96,96,${o})`, flexShrink: 0 }} />
          ))}
          <span className="font-mono text-[8px] text-muted ml-1">Más</span>
        </div>
      </div>

      {/* Tooltip — fixed position following the hovered cell */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: Math.max(8, Math.min(tooltip.x - 104, (typeof window !== "undefined" ? window.innerWidth : 1200) - 216)),
            top: tooltip.y,
            transform: "translateY(calc(-100% - 10px))",
          }}
        >
          <div
            className="w-52 p-3 shadow-xl"
            style={{ backgroundColor: "var(--elevated)", border: "1px solid var(--border)" }}
          >
            <p className="font-mono text-[9px] text-muted mb-2 capitalize leading-tight">
              {formatTooltipDate(tooltip.day.date)}
            </p>
            <p className={`font-mono text-[14px] font-semibold mb-[6px] ${tooltip.day.pnl >= 0 ? "text-profit" : "text-loss"}`}>
              {formatPnl(tooltip.day.pnl)}
            </p>
            <p className="font-mono text-[10px] text-secondary mb-2">
              {tooltip.day.tradeCount} operación{tooltip.day.tradeCount !== 1 ? "es" : ""}
            </p>
            {tooltip.day.bestTrade && (
              <div className="flex items-center gap-1 mb-[6px]">
                <span className="font-mono text-[9px] text-muted">Mejor:</span>
                <span className="font-mono text-[9px] text-secondary font-semibold">{tooltip.day.bestTrade.pair}</span>
                <span className={`font-mono text-[9px] ml-auto ${tooltip.day.bestTrade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                  {formatPnl(tooltip.day.bestTrade.pnl)}
                </span>
              </div>
            )}
            {tooltip.day.emotions && Object.keys(tooltip.day.emotions).length > 0 && (
              <p className="font-mono text-[9px] text-muted leading-relaxed">
                {Object.entries(tooltip.day.emotions)
                  .map(([e, c]) => `${EMOTION_ES[e] ?? e}${c > 1 ? ` ×${c}` : ""}`)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

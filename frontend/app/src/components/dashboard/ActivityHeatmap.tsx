import type { HeatmapDay } from "@/types";
import { formatDateShort } from "@/lib/format";

interface Props {
  data: HeatmapDay[];
  loading?: boolean;
}

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKS = 52;
const CELL = 11;

function heatColor(pnl: number, maxAbs: number): string {
  if (maxAbs === 0) return "rgba(255,255,255,0.05)";
  const intensity = Math.min(Math.abs(pnl) / maxAbs, 1);

  if (pnl > 0) {
    // Green with scaled opacity
    const opacity = 0.2 + intensity * 0.8;
    return `rgba(47,172,102,${opacity.toFixed(2)})`;
  }
  if (pnl < 0) {
    const opacity = 0.2 + intensity * 0.8;
    return `rgba(240,96,96,${opacity.toFixed(2)})`;
  }
  return "rgba(255,255,255,0.05)";
}

export default function ActivityHeatmap({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-24 mb-4 rounded-sm" />
        <div className="skeleton w-full h-20 rounded-sm" />
      </div>
    );
  }

  // Build a map of date → HeatmapDay
  const byDate = new Map<string, HeatmapDay>();
  for (const d of data) byDate.set(d.date, d);

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl)), 0.01);

  // Build 52 weeks × 7 days grid
  // Week 0 = oldest, Week 51 = current
  const today = new Date();
  // Align to Monday
  const todayDow = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() - todayDow + 6); // end = Sunday of current week

  const cells: Array<{ date: string; pnl: number; tradeCount: number }[]> = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week: typeof cells[0] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(gridEnd);
      cellDate.setDate(gridEnd.getDate() - w * 7 - (6 - d));
      const iso = cellDate.toISOString().slice(0, 10);
      const hit = byDate.get(iso);
      week.push({
        date: iso,
        pnl: hit?.pnl ?? 0,
        tradeCount: hit?.tradeCount ?? 0,
      });
    }
    cells.push(week);
  }

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-3">
        Actividad · 52 semanas
      </p>
      <div className="flex gap-0 overflow-x-auto">
        {/* Day labels */}
        <div
          className="flex flex-col gap-[2px] mr-2 flex-shrink-0"
          style={{ paddingTop: 0 }}
        >
          {DAYS.map((d) => (
            <div
              key={d}
              className="font-mono text-[8px] text-muted flex items-center justify-end"
              style={{ height: CELL, width: 10 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px]">
          {cells.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={
                    cell.tradeCount > 0
                      ? `${formatDateShort(cell.date)} · ${cell.tradeCount} op${cell.tradeCount !== 1 ? "s" : ""} · ${cell.pnl >= 0 ? "+" : ""}${cell.pnl.toFixed(2)}€`
                      : formatDateShort(cell.date)
                  }
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background:
                      cell.tradeCount > 0
                        ? heatColor(cell.pnl, maxAbs)
                        : "rgba(255,255,255,0.05)",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        <span className="font-mono text-[8px] text-muted">Menos</span>
        {[0.15, 0.35, 0.6, 0.9].map((o) => (
          <div
            key={o}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 2,
              background: `rgba(47,172,102,${o})`,
            }}
          />
        ))}
        <span className="font-mono text-[8px] text-muted">Más</span>
      </div>
    </div>
  );
}

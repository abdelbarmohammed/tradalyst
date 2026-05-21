"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { useTranslations } from "next-intl";
import { formatPnl, formatDateMedium } from "@/lib/format";
import ChartTooltip, { type ChartEntry } from "@/components/charts/ChartTooltip";
import type { PnlPoint } from "@/types";

const H = 160;

interface Props {
  data: PnlPoint[];
  loading?: boolean;
}

export default function PnlChart({ data, loading }: Props) {
  const t = useTranslations("dashboard");

  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-24 mb-4 rounded-sm" />
        <div className="skeleton w-full rounded-sm" style={{ height: H }} />
      </div>
    );
  }

  const pts = data.filter((d) => Number.isFinite(d.cumPnl));

  if (pts.length < 2) {
    return (
      <div
        className="card p-5 flex items-center justify-center"
        style={{ minHeight: H + 40 }}
      >
        <p className="font-mono text-[11px] text-muted">{t("pnlNoData")}</p>
      </div>
    );
  }

  const minY = Math.min(...pts.map((p) => p.cumPnl));
  const maxY = Math.max(...pts.map((p) => p.cumPnl));
  const isPositive = (pts[pts.length - 1]?.cumPnl ?? 0) >= 0;
  const lineColor = isPositive ? "#2fac66" : "#f06060";

  const yTicks = Array.from(
    new Set([maxY, 0, minY].filter(Number.isFinite))
  );

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-3">
        {t("pnlTitle")}
      </p>
      <ResponsiveContainer width="100%" height={H}>
        <AreaChart data={pts} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="pnl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {minY < 0 && maxY > 0 && (
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3 3"
            />
          )}

          <YAxis
            width={52}
            axisLine={false}
            tickLine={false}
            ticks={yTicks}
            tickFormatter={(v: number) =>
              `${v >= 0 ? "+" : ""}€${Math.abs(v).toFixed(0)}`
            }
            tick={{
              fill: "rgba(156,163,175,0.8)",
              fontSize: 8,
              fontFamily: "var(--font-ibm-plex-mono)",
            }}
          />
          <XAxis dataKey="date" hide />

          <Tooltip
            content={(props: TooltipContentProps) => (
              <ChartTooltip
                active={props.active}
                payload={props.payload as unknown as ChartEntry[]}
                label={props.label !== undefined ? String(props.label) : undefined}
                formatValue={formatPnl}
                formatLabel={(l) => formatDateMedium(l)}
              />
            )}
          />

          <Area
            type="monotone"
            dataKey="cumPnl"
            stroke={lineColor}
            strokeWidth={1.5}
            fill="url(#pnl-grad)"
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Date range labels aligned with chart area */}
      <div
        className="flex items-center justify-between mt-1"
        style={{ paddingLeft: 52, paddingRight: 8 }}
      >
        <span className="font-mono text-[8px] text-muted">
          {pts[0].date.slice(5)}
        </span>
        <span className="font-mono text-[8px] text-muted">
          {pts[pts.length - 1].date.slice(5)}
        </span>
      </div>
    </div>
  );
}

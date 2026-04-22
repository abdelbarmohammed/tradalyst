import Link from "next/link";
import { formatRelative } from "@/lib/format";
import type { AiInsight, TradeStats } from "@/types";

const AI_MIN_TRADES = 5; // Must match backend core/constants.py AI_INSIGHT_MIN_TRADES

interface Props {
  insight: AiInsight | null;
  stats: TradeStats | null;
  loading?: boolean;
}

export default function AiInsightCard({ insight, stats, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5 flex flex-col gap-3">
        <div className="skeleton h-3 w-32 rounded-sm" />
        <div className="skeleton h-3 w-full rounded-sm" />
        <div className="skeleton h-3 w-4/5 rounded-sm" />
        <div className="skeleton h-3 w-3/5 rounded-sm" />
      </div>
    );
  }

  const totalTrades = stats?.total_trades ?? 0;

  // Empty state — not enough trades yet
  if (!insight || totalTrades < AI_MIN_TRADES) {
    const progress = Math.min(totalTrades, AI_MIN_TRADES);
    const pct = (progress / AI_MIN_TRADES) * 100;

    return (
      <div className="card p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-muted" />
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
            IA · Análisis
          </span>
        </div>

        <p className="font-sans text-[13px] text-secondary leading-relaxed mb-5">
          Registra {AI_MIN_TRADES} operaciones para activar tu primer análisis de IA.
        </p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-muted">
              {progress} / {AI_MIN_TRADES} operaciones
            </span>
            <span className="font-mono text-[10px] text-muted">
              {Math.round(pct)}%
            </span>
          </div>
          <div className="h-[4px] bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-green/50 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <Link
          href="/journal/new"
          className="mt-auto font-sans text-[12px] font-semibold text-green hover:underline"
        >
          + Registrar operación
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-slow flex-shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-green">
          IA · Insight semanal
        </span>
        <span className="font-mono text-[9px] text-muted ml-auto whitespace-nowrap">
          {formatRelative(insight.created_at)}
        </span>
      </div>

      {/* Content */}
      <p className="font-sans text-[13px] text-secondary leading-relaxed flex-1">
        {insight.content.length > 300
          ? `${insight.content.slice(0, 300)}…`
          : insight.content}
      </p>

      {/* Period */}
      <p className="font-mono text-[9px] text-muted">
        Período: {insight.period_start} → {insight.period_end} · {insight.trade_count} ops
      </p>

      {/* CTA */}
      <Link
        href="/ai"
        className="font-sans text-[12px] font-semibold text-green hover:underline"
      >
        Hablar con la IA →
      </Link>
    </div>
  );
}

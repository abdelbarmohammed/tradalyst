"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatRelative } from "@/lib/format";
import type { AiInsight, TradeStats } from "@/types";

const AI_MIN_TRADES = 5; // Must match backend core/constants.py AI_INSIGHT_MIN_TRADES

interface Props {
  insight: AiInsight | null;
  stats: TradeStats | null;
  loading?: boolean;
}

export default function AiInsightCard({ insight, stats, loading }: Props) {
  const t = useTranslations("aiInsightCard");

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

  // Not enough trades yet — show progress bar
  if (totalTrades < AI_MIN_TRADES) {
    const pct = (totalTrades / AI_MIN_TRADES) * 100;
    return (
      <div className="card p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-muted" />
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
            {t("header")}
          </span>
        </div>
        <p className="font-sans text-[13px] text-secondary leading-relaxed mb-5">
          {t("autoGenerate")}
        </p>
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-muted">
              {t("progress", { current: totalTrades, total: AI_MIN_TRADES })}
            </span>
            <span className="font-mono text-[10px] text-muted">{Math.round(pct)}%</span>
          </div>
          <div className="h-[4px] bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-green/50 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Link href="/journal/new" className="mt-auto font-sans text-[12px] font-semibold text-green hover:underline">
          {t("logTrade")}
        </Link>
      </div>
    );
  }

  // Enough trades but no insight generated yet
  if (!insight) {
    return (
      <div className="card p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-muted animate-pulse-slow" />
          <span className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
            {t("header")}
          </span>
        </div>
        <p className="font-sans text-[13px] text-secondary leading-relaxed mb-3">
          {t("autoGenerate")}
        </p>
        <p className="font-mono text-[10px] text-muted mb-5">
          {t("tradeCount", { count: totalTrades })}
        </p>
        <Link href="/ai" className="mt-auto font-sans text-[12px] font-semibold text-green hover:underline">
          {t("goToAi")}
        </Link>
      </div>
    );
  }

  // Insight available
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-slow flex-shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-green">
          {t("weeklyLabel")}
        </span>
        <span className="font-mono text-[9px] text-muted ml-auto whitespace-nowrap">
          {formatRelative(insight.created_at)}
        </span>
      </div>
      <p className="font-sans text-[13px] text-secondary leading-relaxed flex-1">
        {insight.content.length > 300 ? `${insight.content.slice(0, 300)}…` : insight.content}
      </p>
      <p className="font-mono text-[9px] text-muted">
        {t("period", { start: insight.period_start, end: insight.period_end, count: insight.trade_count })}
      </p>
      <Link href="/ai" className="font-sans text-[12px] font-semibold text-green hover:underline">
        {t("chatCta")}
      </Link>
    </div>
  );
}

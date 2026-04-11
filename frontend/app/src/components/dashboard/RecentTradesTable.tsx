"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDateShort, formatPnl } from "@/lib/format";
import type { Trade } from "@/types";

interface Props {
  trades: Trade[];
  loading?: boolean;
}

export default function RecentTradesTable({ trades, loading }: Props) {
  const t = useTranslations("dashboard");
  const tJournal = useTranslations("journal");

  const EMOTION_LABELS: Record<string, string> = {
    calm:      tJournal("emotions.calm"),
    confident: tJournal("emotions.confident"),
    fearful:   tJournal("emotions.fearful"),
    greedy:    tJournal("emotions.greedy"),
    anxious:   tJournal("emotions.anxious"),
    fomo:      "FOMO",
    revenge:   "Revenge",
    neutral:   tJournal("emotions.neutral"),
  };

  const columns = [
    tJournal("colDate"),
    tJournal("colPair"),
    tJournal("colDir"),
    "Result.",
    tJournal("colPnl"),
    tJournal("colEmotion"),
  ];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          {t("recentTrades")}
        </p>
        <Link
          href="/journal"
          className="font-mono text-[10px] text-green hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-9 w-full rounded-sm" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-sans text-[13px] text-muted">
            {t("emptyState")}
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_80px_80px_1fr_1fr] gap-3 px-5 py-2 border-b border-white/[0.04]">
            {columns.map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {trades.map((trade) => {
            const pnl = trade.pnl !== null ? parseFloat(trade.pnl) : null;
            const isLong = trade.direction === "long";
            const isWin = trade.result === "win";
            const isLoss = trade.result === "loss";

            return (
              <Link
                key={trade.id}
                href={`/journal/${trade.id}`}
                className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1.5fr_1fr_80px_80px_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-100 items-center"
              >
                {/* Date */}
                <span className="font-mono text-[11px] text-secondary">
                  {formatDateShort(trade.entry_time)}
                </span>

                {/* Pair */}
                <span className="font-sans text-[12px] font-semibold text-primary">
                  {trade.pair}
                </span>

                {/* Direction */}
                <span className={`font-mono text-[10px] px-2 py-[2px] w-fit ${isLong ? "pill-long" : "pill-short"}`}>
                  {isLong ? "Long" : "Short"}
                </span>

                {/* Result */}
                {trade.result ? (
                  <span
                    className={`font-mono text-[10px] px-2 py-[2px] w-fit ${
                      isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"
                    }`}
                  >
                    {isWin ? "Win" : isLoss ? "Loss" : "BE"}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted">—</span>
                )}

                {/* P&L */}
                {pnl !== null ? (
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      pnl >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    {formatPnl(pnl)}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-muted">—</span>
                )}

                {/* Emotion */}
                <span className="font-mono text-[10px] text-secondary hidden sm:block">
                  {trade.emotion ? (EMOTION_LABELS[trade.emotion] ?? trade.emotion) : "—"}
                </span>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}

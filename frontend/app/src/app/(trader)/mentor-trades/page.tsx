"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { get } from "@/lib/api";
import { formatPnl, formatDateShort } from "@/lib/format";
import type { Trade, PaginatedTrades } from "@/types";

export default function MentorTradesPage() {
  const t = useTranslations("mentorTrades");
  const tJournal = useTranslations("journal");

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

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<PaginatedTrades>("/api/mentors/mentor-trades/?page_size=100")
      .then((res) => setTrades(res.results))
      .catch((err) => setError(err instanceof Error ? err.message : t("errorLoad")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
          <ChevronLeft size={12} />
          {t("back")}
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{t("title")}</h1>
        {!loading && !error && (
          <p className="font-mono text-[11px] text-muted mt-[3px]">{t("subtitle", { count: trades.length })}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-sm" />)}
        </div>
      ) : trades.length === 0 && !error ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <p className="font-sans text-[15px] text-secondary">{t("empty")}</p>
        </div>
      ) : (
        <div className="card divide-y divide-white/[0.05]">
          {trades.map((trade) => {
            const pnl = trade.pnl !== null ? parseFloat(trade.pnl) : null;
            const isWin = trade.result === "win";
            const isLoss = trade.result === "loss";
            return (
              <div key={trade.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[13px] font-semibold text-primary">{trade.pair}</span>
                    <span className={`font-mono text-[9px] px-2 py-[2px] ${trade.direction === "long" ? "pill-long" : "pill-short"}`}>
                      {trade.direction === "long" ? "Long" : "Short"}
                    </span>
                    {trade.result && (
                      <span className={`font-mono text-[9px] px-2 py-[2px] ${isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"}`}>
                        {isWin ? "Win" : isLoss ? "Loss" : "BE"}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-muted mt-[2px]">
                    {formatDateShort(trade.entry_time)}
                    {trade.emotion ? ` · ${EMOTION_LABELS[trade.emotion] ?? trade.emotion}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {pnl !== null ? (
                    <p className={`font-mono text-[13px] ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {formatPnl(pnl)}
                    </p>
                  ) : (
                    <p className="font-mono text-[13px] text-muted">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

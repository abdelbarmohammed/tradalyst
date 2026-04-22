import Link from "next/link";
import { formatDateShort, formatPnl } from "@/lib/format";
import type { Trade } from "@/types";

interface Props {
  trades: Trade[];
  loading?: boolean;
}

const EMOTION_LABELS: Record<string, string> = {
  calm:      "Tranquilo",
  confident: "Confiado",
  fearful:   "Con miedo",
  greedy:    "Codicioso",
  anxious:   "Ansioso",
  fomo:      "FOMO",
  revenge:   "Revenge",
  neutral:   "Neutral",
};

export default function RecentTradesTable({ trades, loading }: Props) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          Operaciones recientes
        </p>
        <Link
          href="/journal"
          className="font-mono text-[10px] text-green hover:underline"
        >
          Ver todas →
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
            Aún no tienes operaciones registradas.
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1.5fr_1fr_80px_80px_1fr_1fr] gap-3 px-5 py-2 border-b border-white/[0.04]">
            {["Fecha", "Activo", "Dir.", "Result.", "P&L", "Emoción"].map((h) => (
              <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {trades.map((t) => {
            const pnl = t.pnl !== null ? parseFloat(t.pnl) : null;
            const isLong = t.direction === "long";
            const isWin = t.result === "win";
            const isLoss = t.result === "loss";

            return (
              <Link
                key={t.id}
                href={`/journal/${t.id}`}
                className="grid grid-cols-[1fr_1fr_auto] sm:grid-cols-[1.5fr_1fr_80px_80px_1fr_1fr] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-100 items-center"
              >
                {/* Date */}
                <span className="font-mono text-[11px] text-secondary">
                  {formatDateShort(t.entry_time)}
                </span>

                {/* Pair */}
                <span className="font-sans text-[12px] font-semibold text-primary">
                  {t.pair}
                </span>

                {/* Direction */}
                <span className={`font-mono text-[10px] px-2 py-[2px] w-fit ${isLong ? "pill-long" : "pill-short"}`}>
                  {isLong ? "Long" : "Short"}
                </span>

                {/* Result */}
                {t.result ? (
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
                  {t.emotion ? (EMOTION_LABELS[t.emotion] ?? t.emotion) : "—"}
                </span>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}

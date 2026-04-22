"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil, Trash2, X } from "lucide-react";
import { get, del } from "@/lib/api";
import { formatPnl, formatDateShort, formatRelative } from "@/lib/format";
import type { Trade } from "@/types";

const EMOTION_LABELS: Record<string, string> = {
  calm:      "Tranquilo",
  confident: "Confiado",
  fearful:   "Incierto",
  greedy:    "Codicioso",
  anxious:   "Ansioso",
  fomo:      "FOMO",
  revenge:   "Revenge",
  neutral:   "Neutral",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[3px] py-3 border-b border-white/[0.05] last:border-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      <div className="font-mono text-[12px] text-primary">{children}</div>
    </div>
  );
}

function DeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted hover:text-primary">
          <X size={14} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">
          Confirmar eliminación
        </p>
        <p className="font-sans text-[14px] text-primary mb-5">
          Esta operación se eliminará permanentemente. No se puede deshacer.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 font-sans text-[13px] font-semibold px-4 py-[9px] bg-loss/80 hover:bg-loss text-white transition-colors disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    get<Trade>(`/api/trades/${id}/`)
      .then(setTrade)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar la operación.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await del(`/api/trades/${id}/`);
      router.push("/journal");
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto space-y-5">
        <div className="skeleton h-4 w-24 rounded-sm" />
        <div className="skeleton h-6 w-48 rounded-sm" />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded-sm" />
            ))}
          </div>
          <div className="card p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="max-w-[900px] mx-auto">
        <p className="font-sans text-[14px] text-loss">{error ?? "Operación no encontrada."}</p>
        <Link href="/journal" className="font-mono text-[11px] text-green hover:underline mt-3 inline-block">
          ← Volver al diario
        </Link>
      </div>
    );
  }

  const pnl = trade.pnl !== null ? parseFloat(trade.pnl) : null;
  const isLong = trade.direction === "long";
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";

  return (
    <>
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          deleting={deleting}
        />
      )}

      <div className="max-w-[900px] mx-auto space-y-5">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/journal"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3"
            >
              <ChevronLeft size={12} />
              Diario de operaciones
            </Link>
            <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
              {trade.pair}
            </h1>
            <p className="font-mono text-[11px] text-muted mt-[3px]">
              {formatDateShort(trade.entry_time)} · {formatRelative(trade.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/journal/${id}/edit`}
              className="flex items-center gap-2 font-sans text-[12px] font-semibold border border-white/[0.12] text-secondary hover:text-primary px-4 py-[8px] transition-colors"
            >
              <Pencil size={13} />
              Editar
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 font-sans text-[12px] border border-loss/30 text-loss hover:bg-loss/[0.08] px-4 py-[8px] transition-colors"
            >
              <Trash2 size={13} />
              Eliminar
            </button>
          </div>
        </div>

        {/* ── Two-column detail ── */}
        <div className="grid lg:grid-cols-[55fr_45fr] gap-4">

          {/* Left — trade fields */}
          <div className="card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">
              Detalles
            </p>

            <Row label="Dirección">
              <span
                className={`inline-block font-mono text-[10px] px-2 py-[2px] ${
                  isLong ? "pill-long" : "pill-short"
                }`}
              >
                {isLong ? "Long" : "Short"}
              </span>
            </Row>

            <Row label="Resultado">
              {trade.result ? (
                <span
                  className={`inline-block font-mono text-[10px] px-2 py-[2px] ${
                    isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"
                  }`}
                >
                  {isWin ? "Win" : isLoss ? "Loss" : "Breakeven"}
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </Row>

            <Row label="P&L">
              {pnl !== null ? (
                <span className={pnl >= 0 ? "text-profit" : "text-loss"}>
                  {formatPnl(pnl)}
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </Row>

            <Row label="Precio entrada">
              {parseFloat(trade.entry_price).toLocaleString("es-ES", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </Row>

            <Row label="Precio salida">
              {trade.exit_price ? (
                parseFloat(trade.exit_price).toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8,
                })
              ) : (
                <span className="text-muted">—</span>
              )}
            </Row>

            <Row label="Cantidad">
              {parseFloat(trade.quantity).toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8,
              })}
            </Row>

            {trade.risk_reward_ratio && (
              <Row label="Risk/Reward">
                {parseFloat(trade.risk_reward_ratio).toFixed(2)}
              </Row>
            )}

            <Row label="Entrada">
              {formatDateShort(trade.entry_time)}
            </Row>

            {trade.exit_time && (
              <Row label="Salida">
                {formatDateShort(trade.exit_time)}
              </Row>
            )}

            <Row label="Emoción">
              {trade.emotion ? (
                EMOTION_LABELS[trade.emotion] ?? trade.emotion
              ) : (
                <span className="text-muted">—</span>
              )}
            </Row>
          </div>

          {/* Right — notes + AI placeholder */}
          <div className="space-y-4">
            {/* Notes */}
            <div className="card p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">
                Razonamiento
              </p>
              {trade.notes ? (
                <p className="font-sans text-[13px] text-secondary leading-relaxed whitespace-pre-wrap">
                  {trade.notes}
                </p>
              ) : (
                <p className="font-sans text-[13px] text-muted italic">
                  No hay notas para esta operación.
                </p>
              )}
            </div>

            {/* AI analysis placeholder */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-[7px] h-[7px] rounded-full bg-muted" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  IA · Análisis de operación
                </span>
              </div>
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                El análisis individual por operación estará disponible próximamente.
              </p>
              <Link
                href="/ai"
                className="mt-4 inline-block font-sans text-[12px] font-semibold text-green hover:underline"
              >
                Hablar con la IA →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

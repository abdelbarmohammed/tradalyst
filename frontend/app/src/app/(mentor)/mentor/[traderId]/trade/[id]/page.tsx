"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { get, post } from "@/lib/api";
import { formatPnl, formatDateShort, formatDateTime, formatRelative } from "@/lib/format";
import type { Trade, PaginatedTrades, MentorAnnotation } from "@/types";

const EMOTION_LABELS: Record<string, string> = {
  calm: "Tranquilo", confident: "Confiado", fearful: "Incierto",
  greedy: "Codicioso", anxious: "Ansioso", fomo: "FOMO",
  revenge: "Revenge", neutral: "Neutral",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[3px] py-3 border-b border-white/[0.05] last:border-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="font-mono text-[12px] text-primary">{children}</div>
    </div>
  );
}

export default function MentorTradeDetailPage() {
  const { traderId, id } = useParams<{ traderId: string; id: string }>();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [annotations, setAnnotations] = useState<MentorAnnotation[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loadingTrade, setLoadingTrade] = useState(true);
  const [loadingAnnotations, setLoadingAnnotations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    get<PaginatedTrades>(`/api/mentors/traders/${traderId}/trades/?page_size=100`)
      .then((res) => {
        const found = res.results.find((t) => String(t.id) === id);
        if (found) {
          setTrade(found);
        } else {
          setError("Operación no encontrada.");
        }
      })
      .catch(() => setError("Error al cargar la operación."))
      .finally(() => setLoadingTrade(false));
  }, [traderId, id]);

  useEffect(() => {
    get<{ count: number; results: MentorAnnotation[] }>(`/api/mentors/trades/${id}/annotations/`)
      .then((res) => setAnnotations(res.results))
      .catch(() => {})
      .finally(() => setLoadingAnnotations(false));
  }, [id]);

  async function handleSubmitAnnotation() {
    const content = newNote.trim();
    if (!content) return;
    setSubmitting(true);
    setNoteError(null);
    try {
      const created = await post<MentorAnnotation>(`/api/mentors/trades/${id}/annotations/`, { body: content });
      setAnnotations((prev) => [created, ...prev]);
      setNewNote("");
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Error al guardar la anotación.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingTrade) {
    return (
      <div className="max-w-[900px] mx-auto space-y-5">
        <div className="skeleton h-4 w-24 rounded-sm" />
        <div className="skeleton h-6 w-48 rounded-sm" />
        <div className="grid lg:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              {[...Array(5)].map((_, j) => <div key={j} className="skeleton h-10 w-full rounded-sm" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="max-w-[900px] mx-auto">
        <p className="font-sans text-[14px] text-loss">{error ?? "Operación no encontrada."}</p>
        <Link href={`/mentor/${traderId}`} className="font-mono text-[11px] text-green hover:underline mt-3 inline-block">
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
    <div className="max-w-[900px] mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div>
        <Link
          href={`/mentor/${traderId}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3"
        >
          <ChevronLeft size={12} />
          Diario del trader
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">{trade.pair}</h1>
        <p className="font-mono text-[11px] text-muted mt-[3px]">
          {formatDateShort(trade.entry_time)} · {formatRelative(trade.created_at)}
        </p>
      </div>

      {/* ── Detail + Annotations ── */}
      <div className="grid lg:grid-cols-[55fr_45fr] gap-4">

        {/* Left — trade fields */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">Detalles</p>
            <Row label="Dirección">
              <span className={`inline-block font-mono text-[10px] px-2 py-[2px] ${isLong ? "pill-long" : "pill-short"}`}>
                {isLong ? "Long" : "Short"}
              </span>
            </Row>
            <Row label="Resultado">
              {trade.result ? (
                <span className={`inline-block font-mono text-[10px] px-2 py-[2px] ${isWin ? "pill-win" : isLoss ? "pill-loss" : "pill-be"}`}>
                  {isWin ? "Win" : isLoss ? "Loss" : "Breakeven"}
                </span>
              ) : <span className="text-muted">—</span>}
            </Row>
            <Row label="P&L">
              {pnl !== null ? (
                <span className={pnl >= 0 ? "text-profit" : "text-loss"}>{formatPnl(pnl)}</span>
              ) : <span className="text-muted">—</span>}
            </Row>
            <Row label="Precio entrada">
              {parseFloat(trade.entry_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
            </Row>
            <Row label="Precio salida">
              {trade.exit_price
                ? parseFloat(trade.exit_price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                : <span className="text-muted">—</span>}
            </Row>
            <Row label="Cantidad">
              {parseFloat(trade.quantity).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 8 })}
            </Row>
            {trade.risk_reward_ratio && (
              <Row label="Risk/Reward">{parseFloat(trade.risk_reward_ratio).toFixed(2)}</Row>
            )}
            <Row label="Entrada">{formatDateShort(trade.entry_time)}</Row>
            {trade.exit_time && <Row label="Salida">{formatDateShort(trade.exit_time)}</Row>}
            <Row label="Emoción">
              {trade.emotion ? (EMOTION_LABELS[trade.emotion] ?? trade.emotion) : <span className="text-muted">—</span>}
            </Row>
          </div>

          {/* Trader's notes */}
          <div className="card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-3">Razonamiento del trader</p>
            {trade.notes ? (
              <p className="font-sans text-[13px] text-secondary leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
            ) : (
              <p className="font-sans text-[13px] text-muted italic">El trader no añadió notas.</p>
            )}
          </div>
        </div>

        {/* Right — mentor annotations */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Mis anotaciones
            </p>
            {annotations.length > 0 && (
              <span className="font-mono text-[9px] text-muted">{annotations.length}</span>
            )}
          </div>

          {/* New annotation input */}
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Añadir anotación…"
              rows={3}
              className="w-full bg-base border border-white/[0.08] px-3 py-2 font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors resize-none"
            />
            {noteError && <p className="font-mono text-[10px] text-loss">{noteError}</p>}
            <button
              onClick={handleSubmitAnnotation}
              disabled={submitting || !newNote.trim()}
              className="flex items-center gap-2 font-sans text-[12px] font-semibold bg-green hover:bg-green-hover text-white px-4 py-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              {submitting ? "Guardando…" : "Guardar anotación"}
            </button>
          </div>

          {/* Existing annotations */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            {loadingAnnotations ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-sm" />)}
              </div>
            ) : annotations.length === 0 ? (
              <p className="font-sans text-[12px] text-muted">Todavía no has anotado nada en esta operación.</p>
            ) : (
              annotations.map((annotation) => (
                <div key={annotation.id} className="bg-base border border-white/[0.06] p-3">
                  <p className="font-sans text-[13px] text-secondary leading-relaxed whitespace-pre-wrap">
                    {annotation.body}
                  </p>
                  <p className="font-mono text-[9px] text-muted mt-2">
                    {formatDateTime(annotation.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

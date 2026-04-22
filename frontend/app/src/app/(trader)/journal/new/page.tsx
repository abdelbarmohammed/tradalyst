"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { post, get } from "@/lib/api";
import type { Trade } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Direction = "long" | "short";
type MarketType = "crypto" | "forex" | "stocks";
type TradeResult = "win" | "loss" | "breakeven" | "";
type Emotion =
  | "calm"
  | "confident"
  | "fearful"
  | "greedy"
  | "anxious"
  | "fomo"
  | "revenge"
  | "neutral"
  | "";

interface FormData {
  pair: string;
  market_type: MarketType;
  direction: Direction;
  entry_price: string;
  exit_price: string;
  quantity: string;
  entry_time: string;
  exit_time: string;
  result: TradeResult;
  notes: string;
  emotion: Emotion;
}

interface FormErrors {
  pair?: string;
  entry_price?: string;
  exit_price?: string;
  quantity?: string;
  entry_time?: string;
  result?: string;
  general?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOTION_OPTIONS: { value: Emotion; label: string }[] = [
  { value: "calm",      label: "Tranquilo" },
  { value: "confident", label: "Confiado" },
  { value: "neutral",   label: "Neutral" },
  { value: "fearful",   label: "Incierto" },
  { value: "anxious",   label: "Ansioso" },
  { value: "fomo",      label: "FOMO" },
  { value: "greedy",    label: "Codicioso" },
  { value: "revenge",   label: "Revenge" },
];

const RESULT_OPTIONS: { value: TradeResult; label: string }[] = [
  { value: "win",       label: "Win" },
  { value: "loss",      label: "Loss" },
  { value: "breakeven", label: "Breakeven" },
];

function defaultEntryTime(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computePnl(
  direction: Direction,
  entry: string,
  exit: string,
  qty: string
): number | null {
  const e = parseFloat(entry);
  const x = parseFloat(exit);
  const q = parseFloat(qty);
  if (!Number.isFinite(e) || !Number.isFinite(x) || !Number.isFinite(q) || q <= 0) return null;
  return direction === "long" ? (x - e) * q : (e - x) * q;
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.pair.trim()) errors.pair = "El activo es obligatorio.";
  if (!form.entry_price || isNaN(Number(form.entry_price)) || Number(form.entry_price) <= 0)
    errors.entry_price = "Precio de entrada inválido.";
  if (form.exit_price && (isNaN(Number(form.exit_price)) || Number(form.exit_price) <= 0))
    errors.exit_price = "Precio de salida inválido.";
  if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
    errors.quantity = "Cantidad inválida.";
  if (!form.entry_time) errors.entry_time = "La fecha de entrada es obligatoria.";
  return errors;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-mono text-[10px] text-loss mt-[2px]">{error}</p>
      )}
    </div>
  );
}

// ── Input base class ──────────────────────────────────────────────────────────

const inputCls =
  "bg-base border border-white/[0.10] px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full";

const inputErrCls =
  "bg-base border border-loss/40 px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-loss/60 transition-colors w-full";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NewTradePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    pair: "",
    market_type: "crypto",
    direction: "long",
    entry_price: "",
    exit_price: "",
    quantity: "",
    entry_time: defaultEntryTime(),
    exit_time: "",
    result: "",
    notes: "",
    emotion: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // Fetch live price when pair field loses focus
  async function handlePairBlur() {
    const symbol = form.pair.trim().toUpperCase();
    if (!symbol) return;
    setFetchingPrice(true);
    setFetchedPrice(null);
    try {
      const res = await get<Record<string, { price: number; change_24h: number | null; source: string }>>(
        `/api/prices/?symbols=${symbol}`
      );
      const data = res[symbol];
      if (data?.price) setFetchedPrice(data.price);
    } catch {
      // Price fetch is optional — ignore errors
    } finally {
      setFetchingPrice(false);
    }
  }

  function applyFetchedPrice() {
    if (fetchedPrice !== null) {
      set("entry_price", String(fetchedPrice));
      setFetchedPrice(null);
    }
  }

  const pnl = computePnl(form.direction, form.entry_price, form.exit_price, form.quantity);
  const notes_wc = wordCount(form.notes);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const payload: Record<string, unknown> = {
      pair: form.pair.trim().toUpperCase(),
      direction: form.direction,
      entry_price: form.entry_price,
      quantity: form.quantity,
      entry_time: new Date(form.entry_time).toISOString(),
    };
    if (form.exit_price) payload.exit_price = form.exit_price;
    if (form.exit_time) payload.exit_time = new Date(form.exit_time).toISOString();
    if (form.result) payload.result = form.result;
    if (form.notes.trim()) payload.notes = form.notes.trim();
    if (form.emotion) payload.emotion = form.emotion;

    try {
      const trade = await post<Trade>("/api/trades/", payload);
      router.push(`/journal/${trade.id}`);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Error al guardar la operación.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-6">

      {/* ── Back + title ── */}
      <div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-4"
        >
          <ChevronLeft size={12} />
          Volver al diario
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
          Nueva operación
        </h1>
      </div>

      {/* ── Error banner ── */}
      {errors.general && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* ── Section: Activo ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Activo
          </p>

          {/* Market type */}
          <Field label="Mercado">
            <div className="flex gap-[2px] bg-base border border-white/[0.08] w-fit overflow-hidden">
              {(["crypto", "forex", "stocks"] as MarketType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("market_type", m)}
                  className={`font-mono text-[10px] px-4 py-[8px] capitalize transition-colors ${
                    form.market_type === m
                      ? "bg-elevated text-primary"
                      : "text-muted hover:text-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          {/* Pair */}
          <Field label="Activo / Par" error={errors.pair}>
            <div className="relative">
              <input
                type="text"
                value={form.pair}
                onChange={(e) => set("pair", e.target.value)}
                onBlur={handlePairBlur}
                placeholder={
                  form.market_type === "crypto"
                    ? "BTC, ETH, SOL…"
                    : form.market_type === "forex"
                    ? "EURUSD, GBPJPY…"
                    : "AAPL, TSLA…"
                }
                className={errors.pair ? inputErrCls : inputCls}
              />
              {fetchingPrice && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">
                  Cargando…
                </span>
              )}
            </div>
            {fetchedPrice !== null && (
              <button
                type="button"
                onClick={applyFetchedPrice}
                className="mt-1 font-mono text-[10px] text-green hover:underline text-left"
              >
                Usar precio actual: {fetchedPrice.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </button>
            )}
          </Field>
        </div>

        {/* ── Section: Dirección ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Dirección
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => set("direction", "long")}
              className={`py-4 font-sans text-[15px] font-semibold transition-colors border ${
                form.direction === "long"
                  ? "bg-green/15 border-green/40 text-green"
                  : "bg-base border-white/[0.08] text-muted hover:text-secondary"
              }`}
            >
              ↑ Long
            </button>
            <button
              type="button"
              onClick={() => set("direction", "short")}
              className={`py-4 font-sans text-[15px] font-semibold transition-colors border ${
                form.direction === "short"
                  ? "bg-loss/15 border-loss/40 text-loss"
                  : "bg-base border-white/[0.08] text-muted hover:text-secondary"
              }`}
            >
              ↓ Short
            </button>
          </div>
        </div>

        {/* ── Section: Precios ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Precios y cantidad
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio entrada" error={errors.entry_price}>
              <input
                type="number"
                step="any"
                min="0"
                value={form.entry_price}
                onChange={(e) => set("entry_price", e.target.value)}
                placeholder="0.00"
                className={errors.entry_price ? inputErrCls : inputCls}
              />
            </Field>

            <Field label="Precio salida (opcional)" error={errors.exit_price}>
              <input
                type="number"
                step="any"
                min="0"
                value={form.exit_price}
                onChange={(e) => set("exit_price", e.target.value)}
                placeholder="0.00"
                className={errors.exit_price ? inputErrCls : inputCls}
              />
            </Field>
          </div>

          <Field label="Cantidad / Tamaño" error={errors.quantity}>
            <input
              type="number"
              step="any"
              min="0"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              placeholder="0.01"
              className={`${errors.quantity ? inputErrCls : inputCls} max-w-[200px]`}
            />
          </Field>

          {/* Live P&L preview */}
          {pnl !== null && (
            <div className="flex items-center gap-3 p-3 bg-base border border-white/[0.06]">
              <span className="font-mono text-[10px] text-muted uppercase tracking-[0.08em]">
                P&L estimado
              </span>
              <span
                className={`font-mono text-[14px] font-semibold tabular-nums ${
                  pnl >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {pnl >= 0 ? "+" : ""}
                {pnl.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}€
              </span>
            </div>
          )}
        </div>

        {/* ── Section: Fechas ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Fechas
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Entrada" error={errors.entry_time}>
              <input
                type="datetime-local"
                value={form.entry_time}
                onChange={(e) => set("entry_time", e.target.value)}
                className={errors.entry_time ? inputErrCls : inputCls}
              />
            </Field>
            <Field label="Salida (opcional)">
              <input
                type="datetime-local"
                value={form.exit_time}
                onChange={(e) => set("exit_time", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        {/* ── Section: Resultado ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Resultado
          </p>
          <div className="flex gap-2 flex-wrap">
            {RESULT_OPTIONS.map((opt) => {
              const active = form.result === opt.value;
              const activeClass =
                opt.value === "win"
                  ? "bg-green/15 border-green/40 text-green"
                  : opt.value === "loss"
                  ? "bg-loss/15 border-loss/40 text-loss"
                  : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    set("result", form.result === opt.value ? "" : opt.value)
                  }
                  className={`font-mono text-[11px] px-5 py-[8px] border transition-colors ${
                    active
                      ? activeClass
                      : "border-white/[0.08] text-muted hover:text-secondary bg-base"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section: Razonamiento ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Razonamiento (opcional)
            </p>
            <span
              className={`font-mono text-[10px] ${
                notes_wc >= 20 ? "text-green" : "text-muted"
              }`}
            >
              {notes_wc} palabras{notes_wc < 20 ? ` · mín. 20 recomendadas` : ""}
            </span>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="¿Por qué entraste? ¿Qué setup viste? ¿Qué salió bien o mal?"
            rows={5}
            className="bg-base border border-white/[0.10] px-3 py-[9px] font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none leading-relaxed"
          />
        </div>

        {/* ── Section: Estado emocional ── */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Estado emocional (opcional)
          </p>
          <div className="flex gap-2 flex-wrap">
            {EMOTION_OPTIONS.map((opt) => {
              const active = form.emotion === opt.value;
              const isPositive = opt.value === "calm" || opt.value === "confident" || opt.value === "neutral";
              const isNegative = opt.value === "fearful" || opt.value === "greedy" || opt.value === "anxious" || opt.value === "fomo" || opt.value === "revenge";
              const activeClass = isPositive
                ? "bg-green/15 border-green/40 text-green"
                : isNegative
                ? "bg-loss/15 border-loss/40 text-loss"
                : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    set("emotion", form.emotion === opt.value ? "" : opt.value)
                  }
                  className={`font-mono text-[11px] px-4 py-[7px] border transition-colors ${
                    active
                      ? activeClass
                      : "border-white/[0.08] text-muted hover:text-secondary bg-base"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={submitting}
            className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-8 py-[10px] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Guardando…" : "Guardar operación"}
          </button>
          <Link
            href="/journal"
            className="font-sans text-[13px] text-muted hover:text-secondary transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

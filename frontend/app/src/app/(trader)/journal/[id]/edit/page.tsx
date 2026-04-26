"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { get, patch } from "@/lib/api";
import type { Trade } from "@/types";

type Direction = "long" | "short";
type MarketType = "crypto" | "forex" | "stocks";
type TradeResult = "win" | "loss" | "breakeven" | "";
type Emotion = "calm" | "confident" | "fearful" | "greedy" | "anxious" | "fomo" | "revenge" | "neutral" | "";

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
  general?: string;
}

const RESULT_OPTIONS: { value: TradeResult }[] = [
  { value: "win" },
  { value: "loss" },
  { value: "breakeven" },
];

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function detectMarketType(pair: string): MarketType {
  const p = pair.toUpperCase();
  if (/^(EUR|GBP|AUD|NZD|USD|JPY|CAD|CHF|HKD|SGD)/.test(p)) return "forex";
  if (p.length >= 5 && /^[A-Z]+(USD|EUR|BTC)$/.test(p)) return "crypto";
  return "stocks";
}

function computePnl(direction: Direction, entry: string, exit: string, qty: string): number | null {
  const e = parseFloat(entry);
  const x = parseFloat(exit);
  const q = parseFloat(qty);
  if (!Number.isFinite(e) || !Number.isFinite(x) || !Number.isFinite(q) || q <= 0) return null;
  return direction === "long" ? (x - e) * q : (e - x) * q;
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{label}</label>
      {children}
      {error && <p className="font-mono text-[10px] text-loss mt-[2px]">{error}</p>}
    </div>
  );
}

const inputCls = "bg-base border border-white/[0.10] px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full";
const inputErrCls = "bg-base border border-loss/40 px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-loss/60 transition-colors w-full";

export default function EditTradePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("journal");

  const EMOTION_OPTIONS: { value: Emotion; label: string }[] = [
    { value: "calm",      label: t("emotions.calm") },
    { value: "confident", label: t("emotions.confident") },
    { value: "neutral",   label: t("emotions.neutral") },
    { value: "fearful",   label: t("emotions.fearful") },
    { value: "anxious",   label: t("emotions.anxious") },
    { value: "fomo",      label: "FOMO" },
    { value: "greedy",    label: t("emotions.greedy") },
    { value: "revenge",   label: "Revenge" },
  ];

  const [form, setForm] = useState<FormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get<Trade>(`/api/trades/${id}/`)
      .then((trade) => {
        setForm({
          pair: trade.pair,
          market_type: detectMarketType(trade.pair),
          direction: trade.direction as Direction,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price ?? "",
          quantity: trade.quantity,
          entry_time: toLocalDatetime(trade.entry_time),
          exit_time: trade.exit_time ? toLocalDatetime(trade.exit_time) : "",
          result: (trade.result as TradeResult) ?? "",
          notes: trade.notes ?? "",
          emotion: (trade.emotion as Emotion) ?? "",
        });
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : t("formErrorLoad")));
  }, [id, t]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): FormErrors {
    if (!form) return {};
    const errs: FormErrors = {};
    if (!form.pair.trim()) errs.pair = t("formErrorPair");
    if (!form.entry_price || isNaN(Number(form.entry_price)) || Number(form.entry_price) <= 0)
      errs.entry_price = t("formErrorEntryPrice");
    if (form.exit_price && (isNaN(Number(form.exit_price)) || Number(form.exit_price) <= 0))
      errs.exit_price = t("formErrorExitPrice");
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      errs.quantity = t("formErrorQuantity");
    if (!form.entry_time) errs.entry_time = t("formErrorEntryTime");
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const validationErrors = validate();
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
      exit_price: form.exit_price || null,
      exit_time: form.exit_time ? new Date(form.exit_time).toISOString() : null,
      result: form.result || null,
      notes: form.notes.trim() || "",
      emotion: form.emotion || null,
    };

    try {
      await patch<Trade>(`/api/trades/${id}/`, payload);
      router.push(`/journal/${id}`);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : t("formErrorSaveEdit") });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-[720px] mx-auto">
        <p className="font-sans text-[14px] text-loss">{loadError}</p>
        <Link href="/journal" className="font-mono text-[11px] text-green hover:underline mt-3 inline-block">
          ← {t("formBackToJournal")}
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-[720px] mx-auto space-y-4">
        <div className="skeleton h-4 w-24 rounded-sm" />
        <div className="skeleton h-6 w-48 rounded-sm" />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-sm" />)}
      </div>
    );
  }

  const pnl = computePnl(form.direction, form.entry_price, form.exit_price, form.quantity);
  const notes_wc = wordCount(form.notes);

  return (
    <div className="max-w-[720px] mx-auto space-y-6">

      <div>
        <Link href={`/journal/${id}`} className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-4">
          <ChevronLeft size={12} />
          {t("formBackToDetail")}
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
          {t("formTitleEdit")}
        </h1>
      </div>

      {errors.general && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Asset */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionAsset")}
          </p>
          <Field label={t("formMarket")}>
            <div className="flex gap-[2px] bg-base border border-white/[0.08] w-fit overflow-hidden">
              {(["crypto", "forex", "stocks"] as MarketType[]).map((m) => (
                <button key={m} type="button" onClick={() => set("market_type", m)}
                  className={`font-mono text-[10px] px-4 py-[8px] capitalize transition-colors ${form.market_type === m ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}>
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t("formAssetPair")} error={errors.pair}>
            <input type="text" value={form.pair} onChange={(e) => set("pair", e.target.value)} className={errors.pair ? inputErrCls : inputCls} />
          </Field>
        </div>

        {/* Direction */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionDirection")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => set("direction", "long")}
              className={`py-4 font-sans text-[15px] font-semibold transition-colors border ${form.direction === "long" ? "bg-green/15 border-green/40 text-green" : "bg-base border-white/[0.08] text-muted hover:text-secondary"}`}>
              ↑ Long
            </button>
            <button type="button" onClick={() => set("direction", "short")}
              className={`py-4 font-sans text-[15px] font-semibold transition-colors border ${form.direction === "short" ? "bg-loss/15 border-loss/40 text-loss" : "bg-base border-white/[0.08] text-muted hover:text-secondary"}`}>
              ↓ Short
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionPrices")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("formEntryPrice")} error={errors.entry_price}>
              <input type="number" step="any" min="0" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} className={errors.entry_price ? inputErrCls : inputCls} />
            </Field>
            <Field label={t("formExitPrice")} error={errors.exit_price}>
              <input type="number" step="any" min="0" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} className={errors.exit_price ? inputErrCls : inputCls} />
            </Field>
          </div>
          <Field label={t("formQuantity")} error={errors.quantity}>
            <input type="number" step="any" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className={`${errors.quantity ? inputErrCls : inputCls} max-w-[200px]`} />
          </Field>
          {pnl !== null && (
            <div className="flex items-center gap-3 p-3 bg-base border border-white/[0.06]">
              <span className="font-mono text-[10px] text-muted uppercase tracking-[0.08em]">
                {t("formPnlEstimate")}
              </span>
              <span className={`font-mono text-[14px] font-semibold tabular-nums ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionDates")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("formEntryDate")} error={errors.entry_time}>
              <input type="datetime-local" value={form.entry_time} onChange={(e) => set("entry_time", e.target.value)} className={errors.entry_time ? inputErrCls : inputCls} />
            </Field>
            <Field label={t("formExitDate")}>
              <input type="datetime-local" value={form.exit_time} onChange={(e) => set("exit_time", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Result */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionResult")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {RESULT_OPTIONS.map((opt) => {
              const active = form.result === opt.value;
              const activeClass = opt.value === "win" ? "bg-green/15 border-green/40 text-green" : opt.value === "loss" ? "bg-loss/15 border-loss/40 text-loss" : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button key={opt.value} type="button"
                  onClick={() => set("result", form.result === opt.value ? "" : opt.value)}
                  className={`font-mono text-[11px] px-5 py-[8px] border transition-colors ${active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-base"}`}>
                  {opt.value === "win" ? "Win" : opt.value === "loss" ? "Loss" : "Breakeven"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              {t("formSectionNotes")}
            </p>
            <span className={`font-mono text-[10px] ${notes_wc >= 20 ? "text-green" : "text-muted"}`}>
              {t("formWordsCount", { count: notes_wc })}{notes_wc < 20 ? ` ${t("formWordsMin")}` : ""}
            </span>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder={t("formNotesPlaceholder")}
            rows={5}
            className="bg-base border border-white/[0.10] px-3 py-[9px] font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none leading-relaxed"
          />
        </div>

        {/* Emotion */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionEmotion")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {EMOTION_OPTIONS.map((opt) => {
              const active = form.emotion === opt.value;
              const isPositive = opt.value === "calm" || opt.value === "confident" || opt.value === "neutral";
              const isNegative = !isPositive && opt.value !== "";
              const activeClass = isPositive ? "bg-green/15 border-green/40 text-green" : isNegative ? "bg-loss/15 border-loss/40 text-loss" : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button key={opt.value} type="button"
                  onClick={() => set("emotion", form.emotion === opt.value ? "" : opt.value)}
                  className={`font-mono text-[11px] px-4 py-[7px] border transition-colors ${active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-base"}`}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-4">
          <button type="submit" disabled={submitting}
            className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-8 py-[10px] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? t("formSaving") : t("formSaveEdit")}
          </button>
          <Link href={`/journal/${id}`} className="font-sans text-[13px] text-muted hover:text-secondary transition-colors">
            {t("formCancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}

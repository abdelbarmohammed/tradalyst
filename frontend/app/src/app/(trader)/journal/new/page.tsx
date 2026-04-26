"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { post, get } from "@/lib/api";
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

function defaultEntryTime(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
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

export default function NewTradePage() {
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
      // Price fetch is optional
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

  function validate(): FormErrors {
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

  const pnl = computePnl(form.direction, form.entry_price, form.exit_price, form.quantity);
  const notes_wc = wordCount(form.notes);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      setErrors({ general: err instanceof Error ? err.message : t("formErrorSave") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 lg:px-0 pb-28 lg:pb-6 space-y-6">

      <div>
        <Link href="/journal" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-4">
          <ChevronLeft size={12} />
          {t("formBackToJournal")}
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
          {t("formTitleNew")}
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
            {/* Full-width on mobile, auto-width on desktop */}
            <div className="flex gap-[2px] bg-base border border-white/[0.08] w-full sm:w-fit overflow-hidden">
              {(["crypto", "forex", "stocks"] as MarketType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("market_type", m)}
                  className={`flex-1 sm:flex-none font-mono text-[10px] px-4 py-[10px] sm:py-[8px] capitalize transition-colors ${form.market_type === m ? "bg-elevated text-primary" : "text-muted hover:text-secondary"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t("formAssetPair")} error={errors.pair}>
            <div className="relative">
              <input
                type="text"
                value={form.pair}
                onChange={(e) => set("pair", e.target.value)}
                onBlur={handlePairBlur}
                placeholder={form.market_type === "crypto" ? "BTC, ETH, SOL…" : form.market_type === "forex" ? "EURUSD, GBPJPY…" : "AAPL, TSLA…"}
                className={errors.pair ? inputErrCls : inputCls}
              />
              {fetchingPrice && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">
                  {t("formLoadingPrice")}
                </span>
              )}
            </div>
            {fetchedPrice !== null && (
              <button type="button" onClick={applyFetchedPrice} className="mt-1 font-mono text-[10px] text-green hover:underline text-left">
                {t("formUseLivePrice")} {fetchedPrice.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </button>
            )}
          </Field>
        </div>

        {/* Direction — two equal buttons, 52px touch target */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionDirection")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => set("direction", "long")}
              className={`py-[14px] font-sans text-[15px] font-semibold transition-colors border ${form.direction === "long" ? "bg-green/15 border-green/40 text-green" : "bg-base border-white/[0.08] text-muted hover:text-secondary"}`}>
              ↑ Long
            </button>
            <button type="button" onClick={() => set("direction", "short")}
              className={`py-[14px] font-sans text-[15px] font-semibold transition-colors border ${form.direction === "short" ? "bg-loss/15 border-loss/40 text-loss" : "bg-base border-white/[0.08] text-muted hover:text-secondary"}`}>
              ↓ Short
            </button>
          </div>
        </div>

        {/* Prices — stacked on mobile, side-by-side on sm+ */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionPrices")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("formEntryPrice")} error={errors.entry_price}>
              <input type="number" step="any" min="0" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} placeholder="0.00" className={errors.entry_price ? inputErrCls : inputCls} />
            </Field>
            <Field label={t("formExitPrice")} error={errors.exit_price}>
              <input type="number" step="any" min="0" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} placeholder="0.00" className={errors.exit_price ? inputErrCls : inputCls} />
            </Field>
          </div>
          <Field label={t("formQuantity")} error={errors.quantity}>
            <input type="number" step="any" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="0.01" className={errors.quantity ? inputErrCls : inputCls} />
          </Field>
          {pnl !== null && (
            <div className="flex items-center justify-between p-3 bg-base border border-white/[0.06]">
              <span className="font-mono text-[10px] text-muted uppercase tracking-[0.08em]">
                {t("formPnlEstimate")}
              </span>
              <span className={`font-mono text-[16px] font-semibold tabular-nums ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
              </span>
            </div>
          )}
        </div>

        {/* Dates — stacked on mobile, side-by-side on sm+ */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionDates")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("formEntryDate")} error={errors.entry_time}>
              <input type="datetime-local" value={form.entry_time} onChange={(e) => set("entry_time", e.target.value)} className={errors.entry_time ? inputErrCls : inputCls} />
            </Field>
            <Field label={t("formExitDate")}>
              <input type="datetime-local" value={form.exit_time} onChange={(e) => set("exit_time", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Result — 3-col grid, full width on all sizes */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionResult")}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
            {RESULT_OPTIONS.map((opt) => {
              const active = form.result === opt.value;
              const activeClass = opt.value === "win" ? "bg-green/15 border-green/40 text-green" : opt.value === "loss" ? "bg-loss/15 border-loss/40 text-loss" : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button key={opt.value} type="button"
                  onClick={() => set("result", form.result === opt.value ? "" : opt.value)}
                  className={`font-mono text-[11px] px-4 py-[10px] sm:py-[8px] border transition-colors text-center ${active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-base"}`}>
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
            className="bg-base border border-white/[0.10] px-3 py-[9px] font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none leading-relaxed min-h-[120px]"
          />
        </div>

        {/* Emotion — 2-col grid on mobile, flex-wrap on sm+ */}
        <div className="card p-5 space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("formSectionEmotion")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {EMOTION_OPTIONS.map((opt) => {
              const active = form.emotion === opt.value;
              const isPositive = opt.value === "calm" || opt.value === "confident" || opt.value === "neutral";
              const isNegative = !isPositive && opt.value !== "";
              const activeClass = isPositive ? "bg-green/15 border-green/40 text-green" : isNegative ? "bg-loss/15 border-loss/40 text-loss" : "bg-white/[0.06] border-white/20 text-secondary";
              return (
                <button key={opt.value} type="button"
                  onClick={() => set("emotion", form.emotion === opt.value ? "" : opt.value)}
                  className={`font-mono text-[11px] px-4 py-[10px] sm:py-[7px] border transition-colors text-center ${active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-base"}`}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit — stacked on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4">
          <button type="submit" disabled={submitting}
            className="w-full sm:w-auto font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-8 py-[13px] sm:py-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? t("formSaving") : t("formSave")}
          </button>
          <Link href="/journal" className="w-full sm:w-auto font-sans text-[13px] text-muted hover:text-secondary transition-colors text-center sm:text-left py-[11px] sm:py-0 border border-white/[0.08] sm:border-0">
            {t("formCancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}

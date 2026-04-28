"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { patch, post } from "@/lib/api";
import type { Trade } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type TraderType = "crypto" | "forex" | "acciones" | "todos";
type Direction  = "long" | "short";
type TradeResult = "win" | "loss" | "breakeven" | "";
type Emotion = "calm" | "confident" | "fearful" | "greedy" | "anxious" | "fomo" | "revenge" | "neutral" | "";

const DEFAULT_PAIRS: Record<TraderType, string> = {
  crypto:   "BTC",
  forex:    "EURUSD",
  acciones: "AAPL",
  todos:    "",
};

// ── Field helper ──────────────────────────────────────────────────────────────

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

const inputCls =
  "bg-elevated border border-white/[0.10] px-3 py-[9px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full";

// ── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "w-[8px] h-[8px] bg-green"
              : i === current
              ? "w-[20px] h-[8px] bg-green"
              : "w-[8px] h-[8px] bg-white/[0.15]"
          }`}
        />
      ))}
      <span className="font-mono text-[10px] text-muted ml-1">
        {current + 1} / {total}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tJournal = useTranslations("journal");

  const TRADER_TYPES: { value: TraderType; label: string; emoji: string }[] = [
    { value: "crypto",   label: t("traderTypeCrypto"), emoji: "₿" },
    { value: "forex",    label: t("traderTypeForex"),  emoji: "€" },
    { value: "acciones", label: t("traderTypeStocks"), emoji: "📈" },
    { value: "todos",    label: t("traderTypeAll"),    emoji: "∞" },
  ];

  const RESULT_OPTIONS: { value: TradeResult; label: string }[] = [
    { value: "win",       label: "Win" },
    { value: "loss",      label: "Loss" },
    { value: "breakeven", label: "Breakeven" },
  ];

  const EMOTION_OPTIONS: { value: Emotion; label: string }[] = [
    { value: "calm",      label: tJournal("emotions.calm") },
    { value: "confident", label: tJournal("emotions.confident") },
    { value: "neutral",   label: tJournal("emotions.neutral") },
    { value: "fearful",   label: tJournal("emotions.fearful") },
    { value: "fomo",      label: "FOMO" },
    { value: "revenge",   label: "Revenge" },
  ];

  const [step, setStep] = useState(0);
  const [traderType, setTraderType] = useState<TraderType | null>(null);
  const [tradeLogged, setTradeLogged] = useState(false);

  const [pair, setPair]         = useState("");
  const [direction, setDir]     = useState<Direction>("long");
  const [entryPrice, setEntry]  = useState("");
  const [exitPrice, setExit]    = useState("");
  const [quantity, setQty]      = useState("");
  const [entryTime, setEntryTime] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [result, setResult]     = useState<TradeResult>("");
  const [notes, setNotes]       = useState("");
  const [emotion, setEmotion]   = useState<Emotion>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  function handleTypeSelect(type: TraderType) {
    setTraderType(type);
    setPair(DEFAULT_PAIRS[type]);
  }

  function goToStep2() {
    if (!traderType) return;
    setStep(1);
  }

  async function handleTradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!pair.trim()) errors.pair = t("errorPair");
    if (!entryPrice || isNaN(Number(entryPrice)) || Number(entryPrice) <= 0)
      errors.entryPrice = t("errorEntryPrice");
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0)
      errors.quantity = t("errorQuantity");
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        pair: pair.trim().toUpperCase(),
        direction,
        entry_price: entryPrice,
        quantity,
        entry_time: new Date(entryTime).toISOString(),
      };
      if (exitPrice) payload.exit_price = exitPrice;
      if (result) payload.result = result;
      if (notes.trim()) payload.notes = notes.trim();
      if (emotion) payload.emotion = emotion;

      await post<Trade>("/api/trades/", payload);
      setTradeLogged(true);
      await completeOnboarding();
    } catch {
      setFormErrors({ general: t("errorGeneral") });
    } finally {
      setSubmitting(false);
    }
  }

  async function skipToStep3() {
    await completeOnboarding();
  }

  async function completeOnboarding() {
    setCompleting(true);
    try {
      await patch("/api/users/me/", { onboarding_completed: true });
    } catch {
      // Don't block on this
    } finally {
      setCompleting(false);
      setStep(2);
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">

        <div className="mb-8 text-center">
          <span className="font-mono text-[18px] font-bold text-primary tracking-tight">
            tradalyst
          </span>
        </div>

        <StepDots current={step} total={3} />

        {/* ── Step 0 — Trader type ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-sans text-[24px] font-bold text-primary leading-tight mb-2">
                {t("step0Title")}
              </h1>
              <p className="font-sans text-[14px] text-secondary leading-relaxed">
                {t("step0Subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TRADER_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={`py-5 px-4 border transition-colors duration-150 text-left ${
                    traderType === type.value
                      ? "border-green/50 bg-green/10"
                      : "border-white/[0.10] bg-surface hover:border-white/20"
                  }`}
                >
                  <div className="font-sans text-[20px] mb-2">{type.emoji}</div>
                  <div className="font-sans text-[14px] font-semibold text-primary">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={goToStep2}
              disabled={!traderType}
              className="w-full flex items-center justify-center gap-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[11px] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("continue")}
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── Step 1 — First trade ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="font-sans text-[22px] font-bold text-primary leading-tight mb-1">
                {t("step1Title")}
              </h1>
              <p className="font-sans text-[13px] text-muted">
                {t("step1Subtitle")}
              </p>
            </div>

            {formErrors.general && (
              <div className="p-3 border border-loss/30 bg-loss/[0.06]">
                <p className="font-sans text-[12px] text-loss">{formErrors.general}</p>
              </div>
            )}

            <form onSubmit={handleTradeSubmit} className="space-y-4" noValidate>
              <Field label={t("fieldPair")} error={formErrors.pair}>
                <input
                  type="text"
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  placeholder="BTC, EURUSD, AAPL…"
                  className={inputCls}
                />
              </Field>

              <Field label={t("fieldDirection")}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDir("long")}
                    className={`py-3 font-sans text-[13px] font-semibold border transition-colors ${
                      direction === "long"
                        ? "bg-green/15 border-green/40 text-green"
                        : "border-white/[0.10] text-muted hover:text-secondary bg-elevated"
                    }`}
                  >
                    ↑ Long
                  </button>
                  <button
                    type="button"
                    onClick={() => setDir("short")}
                    className={`py-3 font-sans text-[13px] font-semibold border transition-colors ${
                      direction === "short"
                        ? "bg-loss/15 border-loss/40 text-loss"
                        : "border-white/[0.10] text-muted hover:text-secondary bg-elevated"
                    }`}
                  >
                    ↓ Short
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("fieldEntryPrice")} error={formErrors.entryPrice}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={entryPrice}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
                <Field label={t("fieldExitPrice")}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={exitPrice}
                    onChange={(e) => setExit(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label={t("fieldQuantity")} error={formErrors.quantity}>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0.01"
                  className={`${inputCls} max-w-[160px]`}
                />
              </Field>

              <Field label={t("fieldDateTime")}>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label={t("fieldResult")}>
                <div className="flex gap-2">
                  {RESULT_OPTIONS.map((opt) => {
                    const active = result === opt.value;
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
                        onClick={() => setResult(result === opt.value ? "" : opt.value)}
                        className={`font-mono text-[10px] px-4 py-[7px] border transition-colors ${
                          active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-elevated"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={t("fieldEmotion")}>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.map((opt) => {
                    const active = emotion === opt.value;
                    const isPos = opt.value === "calm" || opt.value === "confident" || opt.value === "neutral";
                    const activeClass = isPos
                      ? "bg-green/15 border-green/40 text-green"
                      : "bg-loss/15 border-loss/40 text-loss";
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEmotion(emotion === opt.value ? "" : opt.value)}
                        className={`font-mono text-[10px] px-3 py-[6px] border transition-colors ${
                          active ? activeClass : "border-white/[0.08] text-muted hover:text-secondary bg-elevated"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={t("fieldNotes")}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={t("notesPlaceholder")}
                  className="bg-elevated border border-white/[0.10] px-3 py-[9px] font-sans text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors w-full resize-none"
                />
              </Field>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || completing}
                  className="font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-[10px] rounded transition-colors disabled:opacity-50"
                >
                  {submitting ? t("submitting") : t("submitTrade")}
                </button>
                <button
                  type="button"
                  onClick={skipToStep3}
                  disabled={submitting || completing}
                  className="font-sans text-[13px] text-muted hover:text-secondary transition-colors"
                >
                  {t("skipLabel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 2 — Done ── */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green/20 border border-green/30 flex items-center justify-center mx-auto">
              <Check size={20} className="text-green" />
            </div>

            <div>
              <h1 className="font-sans text-[22px] font-bold text-primary leading-tight mb-3">
                {t("step2Title")}
              </h1>
              <p className="font-sans text-[14px] text-secondary leading-relaxed">
                {tradeLogged ? t("step2BodyLogged") : t("step2BodySkipped")}
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[11px] rounded transition-colors"
            >
              {t("goToDashboard")}
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

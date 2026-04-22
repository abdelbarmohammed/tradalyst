"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ChevronDown } from "lucide-react";
import { APP_URL } from "@/lib/urls";

// ─── Plan features ───────────────────────────────────────────────────────────

const FREE_FEATURES = [
  { text: "Diario ilimitado de operaciones", included: true },
  { text: "Dashboard básico de rendimiento", included: true },
  { text: "Hasta 3 análisis de IA al mes", included: true },
  { text: "Precios en tiempo real (crypto)", included: true },
  { text: "Chat ilimitado con IA", included: false },
  { text: "Vista mentor", included: false },
  { text: "Analítica avanzada", included: false },
  { text: "Forex y acciones en tiempo real", included: false },
];

const PRO_FEATURES = [
  { text: "Todo lo del plan Free", included: true },
  { text: "Insights de IA ilimitados", included: true },
  { text: "Chat ilimitado con IA", included: true },
  { text: "Análisis conductual completo", included: true },
  { text: "Vista mentor incluida", included: true },
  { text: "Analítica avanzada", included: true },
  { text: "Precios en tiempo real (crypto, forex, acciones)", included: true },
];

// ─── Comparison table ─────────────────────────────────────────────────────────

const TABLE_GROUPS = [
  {
    category: "Diario",
    rows: [
      { feature: "Operaciones ilimitadas", free: true, pro: true },
      { feature: "Crypto, forex y acciones", free: true, pro: true },
      { feature: "Razonamiento y etiqueta emocional", free: true, pro: true },
      { feature: "Historial completo", free: true, pro: true },
    ],
  },
  {
    category: "IA",
    rows: [
      { feature: "Insights semanales", free: "3/mes", pro: "Ilimitados" },
      { feature: "Chat directo con la IA", free: false, pro: true },
      { feature: "Análisis conductual", free: false, pro: true },
    ],
  },
  {
    category: "Analítica",
    rows: [
      { feature: "Dashboard básico", free: true, pro: true },
      { feature: "Curva P&L completa", free: false, pro: true },
      { feature: "Heatmap de actividad", free: false, pro: true },
      { feature: "Breakdown por activo y emoción", free: false, pro: true },
    ],
  },
  {
    category: "Mentor",
    rows: [
      { feature: "Vista mentor", free: false, pro: true },
      { feature: "Anotaciones por operación", free: false, pro: true },
    ],
  },
  {
    category: "Precios en tiempo real",
    rows: [
      { feature: "Crypto via CoinGecko", free: true, pro: true },
      { feature: "Forex y acciones via Finnhub", free: false, pro: true },
    ],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "¿Necesito tarjeta de crédito para empezar?",
    a: "No. El plan Free es gratis para siempre sin datos de pago. Solo necesitas un email para registrarte.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. Sin permanencia, sin penalización. Cancelas desde tu cuenta en un clic y no se te cobra nada más.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo?",
    a: "Tu historial sigue siendo tuyo. Puedes exportarlo en cualquier momento en formato CSV antes o después de cancelar.",
  },
  {
    q: "¿Cómo funciona el período de prueba de 7 días?",
    a: "Acceso completo a Pro durante 7 días sin cargo. Si no cancelas antes de que termine el período, se activa la suscripción mensual de €9,99.",
  },
  {
    q: "¿El mentor también paga?",
    a: "No. El mentor crea una cuenta gratuita y accede cuando el trader le asigna desde su plan Pro. La vista mentor es una funcionalidad del plan del trader, no del mentor.",
  },
  {
    q: "¿Qué IA usa Tradalyst?",
    a: "Claude, desarrollado por Anthropic. La misma IA que usan empresas como Slack, Notion y Quora. Especializada en análisis de lenguaje natural — ideal para interpretar el razonamiento detrás de tus operaciones.",
  },
];

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={15} className="text-green mx-auto" />;
  if (value === false)
    return <X size={15} className="text-text-muted mx-auto" />;
  return (
    <span className="font-mono text-[11px] text-text-secondary">{value}</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreciosPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-light min-h-screen">
      {/* ── Section 1 — Header ── */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[760px] mx-auto px-6 lg:px-10 text-center">
          <p className="eyebrow mb-4">Precios</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em] mb-4">
            Precios claros. Sin sorpresas.
          </h1>
          <p className="font-sans text-[17px] text-text-secondary leading-relaxed">
            Empieza gratis hoy. Pasa a Pro cuando estés listo. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* ── Section 2 — Plan cards ── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[860px] mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="bg-white border border-black/[0.08] p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted mb-3">
                FREE
              </p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-mono text-[48px] font-bold text-text tracking-[-0.03em] leading-none">
                  €0
                </span>
              </div>
              <p className="font-mono text-[11px] text-text-muted mb-4">para siempre</p>
              <p className="font-sans text-[13px] text-text-secondary mb-7 leading-relaxed">
                Para empezar sin compromiso.
              </p>
              <ul className="space-y-[10px] mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-3">
                    {f.included ? (
                      <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                    ) : (
                      <X size={14} className="text-text-muted mt-[1px] flex-shrink-0" />
                    )}
                    <span
                      className={`font-sans text-[13px] leading-snug ${
                        f.included ? "text-text-secondary" : "text-text-muted"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`${APP_URL}/registro`}
                className="block w-full text-center font-sans text-sm font-semibold border border-black/[0.15] hover:border-black/[0.3] text-text px-5 py-3 rounded transition-colors duration-150"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-dark border border-green/40 p-8 relative">
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2">
                <span className="font-mono text-[9px] bg-green text-white px-3 py-[4px] uppercase tracking-[0.1em]">
                  Más popular
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-green mb-3">
                PRO
              </p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-mono text-[48px] font-bold text-text-dark-primary tracking-[-0.03em] leading-none">
                  €9,99
                </span>
              </div>
              <p className="font-mono text-[11px] text-text-dark-secondary mb-4">
                al mes · cancela cuando quieras
              </p>
              <p className="font-sans text-[13px] text-text-dark-secondary mb-7 leading-relaxed">
                Para el trader que quiere mejorar en serio.
              </p>
              <ul className="space-y-[10px] mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-3">
                    <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                    <span className="font-sans text-[13px] text-text-dark-primary leading-snug">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`${APP_URL}/registro`}
                className="block w-full text-center font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-3 rounded transition-colors duration-150"
              >
                Probar 7 días gratis
              </Link>
              <p className="font-mono text-[10px] text-text-dark-secondary text-center mt-3">
                Sin tarjeta de crédito
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3 — Comparison table ── */}
      <section className="py-16 lg:py-20 border-t border-black/[0.08]">
        <div className="max-w-[860px] mx-auto px-6 lg:px-10">
          <h2 className="font-sans text-[26px] font-bold text-text tracking-[-0.02em] mb-10">
            Comparativa completa
          </h2>

          <div className="border border-black/[0.08] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px] bg-dark">
              <div className="p-4" />
              <div className="p-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dark-secondary">
                  Free
                </span>
              </div>
              <div className="p-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-green">
                  Pro
                </span>
              </div>
            </div>

            {TABLE_GROUPS.map((group) => (
              <div key={group.category}>
                {/* Category row */}
                <div className="grid grid-cols-[1fr_100px_100px] bg-black/[0.03] border-t border-black/[0.08]">
                  <div className="px-4 py-2 col-span-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                      {group.category}
                    </span>
                  </div>
                </div>
                {/* Feature rows */}
                {group.rows.map((row, ri) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-[1fr_100px_100px] border-t border-black/[0.06] ${
                      ri % 2 === 0 ? "bg-white" : "bg-light/50"
                    }`}
                  >
                    <div className="px-4 py-3">
                      <span className="font-sans text-[13px] text-text-secondary">
                        {row.feature}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center">
                      <Cell value={row.free} />
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center">
                      <Cell value={row.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — FAQ ── */}
      <section className="py-16 lg:py-20 border-t border-black/[0.08]">
        <div className="max-w-[680px] mx-auto px-6 lg:px-10">
          <h2 className="font-sans text-[26px] font-bold text-text tracking-[-0.02em] mb-10">
            Preguntas frecuentes
          </h2>

          <div className="divide-y divide-black/[0.06]">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-sans text-[15px] font-semibold text-text leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="font-sans text-[14px] text-text-secondary leading-relaxed pb-5">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5 — Final CTA band ── */}
      <section
        className="py-20 lg:py-24 border-t border-black/[0.08]"
        style={{ background: "#1e1e1e" }}
      >
        <div className="max-w-[640px] mx-auto px-6 lg:px-10 text-center">
          <p className="font-sans text-[22px] lg:text-[28px] font-bold text-text-dark-primary leading-[1.2] tracking-[-0.02em] mb-8">
            La diferencia entre un trader que mejora y uno que no es el análisis.
          </p>
          <Link
            href={`${APP_URL}/registro`}
            className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-7 py-3 rounded transition-colors duration-150"
          >
            Empezar gratis
          </Link>
        </div>
      </section>
    </div>
  );
}

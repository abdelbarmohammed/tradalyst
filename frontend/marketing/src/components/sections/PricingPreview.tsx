"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { APP_URL } from "@/lib/urls";

const FREE_FEATURES = [
  { text: "Diario ilimitado de operaciones", included: true },
  { text: "Dashboard básico de rendimiento", included: true },
  { text: "Hasta 3 análisis de IA al mes", included: true },
  { text: "Precios en tiempo real (crypto)", included: true },
  { text: "Chat ilimitado con IA", included: false },
  { text: "Vista mentor", included: false },
  { text: "Analítica avanzada", included: false },
];

const PRO_FEATURES = [
  { text: "Todo lo del plan Free", included: true },
  { text: "Insights de IA ilimitados", included: true },
  { text: "Chat ilimitado con IA", included: true },
  { text: "Análisis conductual completo", included: true },
  { text: "Vista mentor incluida", included: true },
  { text: "Analítica avanzada", included: true },
  { text: "Forex y acciones en tiempo real", included: true },
];

export default function PricingPreview() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  return (
    <section className="bg-light py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">Precios</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            Sin sorpresas. Sin $80/mes.
          </h2>
          <p className="font-sans text-[16px] text-text-secondary mt-3 leading-relaxed">
            Empieza gratis hoy. Pasa a Pro cuando estés listo.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={ref}
          className="grid md:grid-cols-2 gap-4 max-w-[760px] mx-auto"
        >
          {/* Free */}
          <div
            className={`bg-white border border-black/[0.08] p-8 transition-all duration-500 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted mb-3">
              FREE
            </p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-mono text-[42px] font-bold text-text tracking-[-0.03em] leading-none">
                €0
              </span>
            </div>
            <p className="font-mono text-[11px] text-text-muted mb-7">para siempre</p>
            <p className="font-sans text-[13px] text-text-secondary mb-7 leading-relaxed">
              Para empezar sin compromiso.
            </p>

            <ul className="space-y-3 mb-8">
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
              className="block w-full text-center font-sans text-sm font-semibold border border-black/[0.15] hover:border-black/[0.25] text-text px-5 py-[11px] rounded transition-colors duration-150"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro */}
          <div
            className={`bg-dark border border-green/40 p-8 relative transition-all duration-500 delay-100 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]"
            }`}
          >
            {/* Badge */}
            <div className="absolute -top-[11px] left-1/2 -translate-x-1/2">
              <span className="font-mono text-[9px] bg-green text-white px-3 py-[4px] uppercase tracking-[0.1em]">
                Más popular
              </span>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-green mb-3">
              PRO
            </p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-mono text-[42px] font-bold text-text-dark-primary tracking-[-0.03em] leading-none">
                €9,99
              </span>
            </div>
            <p className="font-mono text-[11px] text-text-dark-secondary mb-7">
              al mes · cancela cuando quieras
            </p>
            <p className="font-sans text-[13px] text-text-dark-secondary mb-7 leading-relaxed">
              Para el trader que quiere mejorar en serio.
            </p>

            <ul className="space-y-3 mb-8">
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
              className="block w-full text-center font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[11px] rounded transition-colors duration-150"
            >
              Probar 7 días gratis
            </Link>
          </div>
        </div>

        {/* Link to full pricing */}
        <p className="text-center mt-7 font-mono text-[11px] text-text-muted">
          ¿Más preguntas?{" "}
          <Link href="/precios" className="text-green hover:underline">
            Ver comparativa completa →
          </Link>
        </p>
      </div>
    </section>
  );
}

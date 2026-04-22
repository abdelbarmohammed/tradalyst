"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, MessageSquare, Zap } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const INSIGHT_TEXT =
  "En los últimos 30 días has abierto 14 operaciones marcadas como FOMO. 11 fueron pérdidas. Tu mejor rendimiento ocurre los martes entre las 10h y las 13h cuando registras «confiado» como estado emocional. Considera reducir operaciones después de las 15h — tu tasa de error sube un 38%.";

const TAGS = [
  { label: "FOMO Trading ↑", border: "rgba(217,64,64,0.5)", text: "#d94040" },
  { label: "Martes 10h–13h ★", border: "rgba(47,172,102,0.5)", text: "#2fac66" },
  { label: "R:R Mejorando", border: "rgba(47,172,102,0.5)", text: "#2fac66" },
  { label: "BTC Long Bias", border: "rgba(0,0,0,0.18)", text: "#6b7280" },
];

const CAPABILITIES = [
  {
    icon: BrainCircuit,
    title: "Análisis conductual",
    desc: "Detecta FOMO, revenge trading y sobreoperar antes de que se conviertan en pérdidas crónicas.",
  },
  {
    icon: MessageSquare,
    title: "Chat directo con la IA",
    desc: "Pregúntale a tu IA sobre tus operaciones. Responde con datos reales de tu historial.",
  },
  {
    icon: Zap,
    title: "Insights semanales",
    desc: "Cada semana, un análisis nuevo con los patrones más relevantes del período.",
  },
];

export default function AiSpotlight() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const [displayed, setDisplayed] = useState("");
  const [tagsVisible, setTagsVisible] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    setDisplayed("");
    setTagsVisible(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(INSIGHT_TEXT.slice(0, i));
      if (i >= INSIGHT_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setTagsVisible(true), 300);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section className="bg-dark py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-500 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="eyebrow mb-4">IA · Claude</p>
          <h2 className="font-sans text-[36px] font-bold text-text-dark-primary leading-[1.1] tracking-[-0.02em]">
            No solo qué operaste. Por qué lo operaste.
          </h2>
        </div>

        <div ref={ref} className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          {/* Left — typewriter insight card */}
          <div
            className={`transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div
              className="p-7"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {/* Insight header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse-slow" />
                <span className="font-mono text-[10px] text-green uppercase tracking-[0.12em]">
                  IA · Insight semanal
                </span>
                <span className="font-mono text-[10px] text-text-muted ml-auto">
                  hace 2 días
                </span>
              </div>

              {/* Typewriter text */}
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed min-h-[120px]">
                {displayed}
                {displayed.length < INSIGHT_TEXT.length && inView && (
                  <span className="inline-block w-[2px] h-[1em] bg-green ml-[1px] animate-pulse-slow" />
                )}
              </p>

              {/* Tags — appear after typing */}
              <div
                className={`flex flex-wrap gap-2 mt-6 transition-all duration-500 ${
                  tagsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="font-mono text-[10px] px-[10px] py-[4px]"
                    style={{
                      border: `1px solid ${tag.border}`,
                      color: tag.text,
                      background: "transparent",
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — capabilities */}
          <div className="flex flex-col gap-7">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className={`flex gap-4 transition-all duration-500 ${
                    inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                  }`}
                  style={{ transitionDelay: `${i * 150 + 300}ms` }}
                >
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-green/30 rounded">
                    <Icon size={16} className="text-green" />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-text-dark-primary mb-1">
                      {cap.title}
                    </p>
                    <p className="font-sans text-[13px] text-text-dark-secondary leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* CTA */}
            <div
              className={`mt-2 transition-all duration-500 delay-500 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <a
                href="https://app.tradalyst.com/registro"
                className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[11px] rounded transition-colors duration-150"
              >
                Obtén tu análisis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    initials: "JM",
    avatarBg: "#2fac66",
    avatarText: "#ffffff",
    name: "Javier M.",
    role: "Crypto trader · Barcelona",
    quote:
      "Llevaba 8 meses operando BTC y pensaba que era disciplinado. Tradalyst me enseñó que el 73% de mis pérdidas ocurrían en las dos últimas horas del día. Cambié ese hábito y mi win rate pasó del 41% al 63% en ocho semanas.",
  },
  {
    initials: "SL",
    avatarBg: "#272727",
    avatarText: "#e8ebe8",
    name: "Sara L.",
    role: "Forex trader · Madrid",
    quote:
      "La IA detectó que mis operaciones marcadas como FOMO tenían un win rate del 18%, frente al 61% del resto. Sabía que operaba por impulso, pero ver el número exacto lo cambió todo. Tradalyst me obligó a ser honesta conmigo misma.",
  },
  {
    initials: "MA",
    avatarBg: "#f5f6f2",
    avatarText: "#0f1110",
    name: "Miguel A.",
    role: "Daytrader IBEX · Valencia",
    quote:
      "Mi mentor puede anotar mis operaciones sin tocar nada. La semana pasada marcó un patrón que yo no había visto: sobreopero sistemáticamente los lunes después de un fin de semana malo. Llevaba dos años con ese error sin saberlo.",
  },
  {
    initials: "LG",
    avatarBg: "#2fac66",
    avatarText: "#ffffff",
    name: "Lucía G.",
    role: "Crypto trader · Sevilla",
    quote:
      "Añadí razonamiento en cada operación y al mes la IA identificó que mi R:R en operaciones «confiadas» es 2,4 de media, pero en «inciertas» baja a 0,7. Ahora solo entro cuando realmente lo tengo claro.",
  },
  {
    initials: "PT",
    avatarBg: "#303030",
    avatarText: "#e8ebe8",
    name: "Pablo T.",
    role: "Multi-asset trader · Bilbao",
    quote:
      "El breakdown por emoción y por hora del día en el mismo panel que el historial completo — ninguna hoja de cálculo me daba eso. En tres meses reduje mis pérdidas a la mitad.",
  },
  {
    initials: "ER",
    avatarBg: "#eceee8",
    avatarText: "#0f1110",
    name: "Elena R.",
    role: "Swing trader acciones · Zaragoza",
    quote:
      "Intenté llevar un diario en Excel dos años. Siempre lo abandonaba. Tradalyst tarda 60 segundos por operación y la IA hace el análisis que yo nunca conseguía hacer. Llevo 11 meses sin saltarme ni una entrada.",
  },
];

// Duplicate for seamless loop
const ALL = [...TESTIMONIALS, ...TESTIMONIALS];

export default function Testimonials() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="bg-surface py-24 lg:py-32 border-t border-black/[0.08] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 mb-12">
        <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em] text-center">
          Lo que dicen los traders que ya llevan diario.
        </h2>
      </div>

      {/* Carousel track */}
      <div
        className="relative fade-edges"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-4 w-max"
          style={{
            animation: "scroll 28s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {ALL.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-black/[0.08] p-7 flex-shrink-0"
              style={{ width: 340 }}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: t.avatarBg,
                    borderRadius: "2px",
                  }}
                >
                  <span
                    className="font-mono text-[11px] font-semibold"
                    style={{ color: t.avatarText }}
                  >
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-sans text-[13px] font-semibold text-text leading-none">
                    {t.name}
                  </p>
                  <p className="font-mono text-[9px] text-text-muted mt-[3px]">{t.role}</p>
                </div>
              </div>

              {/* Quote */}
              <p className="font-sans text-[13px] text-text-secondary leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

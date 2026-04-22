"use client";

import { useInView } from "@/hooks/useInView";

function FlatLineChart() {
  return (
    <svg viewBox="0 0 120 48" width="120" height="48" aria-hidden="true">
      <path
        d="M 0,30 C 12,28 18,34 28,30 C 38,26 42,33 52,30 C 62,27 66,32 76,30 C 86,28 92,34 102,30 C 108,28 114,31 120,30"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WinFomoChart() {
  return (
    <svg viewBox="0 0 120 48" width="120" height="48" aria-hidden="true">
      {/* Win rate bar */}
      <rect x="8" y="8" width="48" height="10" rx="1" fill="rgba(47,172,102,0.3)" />
      <text x="60" y="17" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="rgba(0,0,0,0.35)">62%</text>
      <text x="8" y="28" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="rgba(0,0,0,0.30)">Win rate</text>
      {/* FOMO bar */}
      <rect x="8" y="34" width="16" height="10" rx="1" fill="rgba(217,64,64,0.25)" />
      <text x="28" y="43" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="rgba(0,0,0,0.35)">21%</text>
      <text x="8" y="31" fontFamily="IBM Plex Mono, monospace" fontSize="6.5" fill="rgba(0,0,0,0.30)">FOMO</text>
    </svg>
  );
}

function DrawdownChart() {
  return (
    <svg viewBox="0 0 120 48" width="120" height="48" aria-hidden="true">
      <path
        d="M 0,12 C 15,10 22,14 35,12 C 45,10 50,14 60,24 C 68,32 72,38 80,38 C 88,38 92,30 100,22 C 108,14 114,14 120,12"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Drawdown zone */}
      <path
        d="M 55,24 C 62,30 68,36 78,38 C 86,38 92,32 100,24 L 100,48 L 55,48 Z"
        fill="rgba(217,64,64,0.08)"
      />
    </svg>
  );
}

const CARDS = [
  {
    num: "01",
    title: "Llevas meses registrando operaciones. No estás aprendiendo de ellas.",
    sub: "Los datos están ahí. El patrón también. Pero sin análisis, son solo números.",
    chart: <FlatLineChart />,
  },
  {
    num: "02",
    title: "Tu win rate parece aceptable. Tu comportamiento dice otra cosa.",
    sub: "FOMO, revenge trading, sobreoperar en días malos — los números no te lo cuentan.",
    chart: <WinFomoChart />,
  },
  {
    num: "03",
    title: "Sabes que algo falla. No sabes exactamente qué.",
    sub: "Sin un diario que lea tu razonamiento, el error se repite indefinidamente.",
    chart: <DrawdownChart />,
  },
];

export default function Problem() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  return (
    <section className="bg-light py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div ref={ref} className="grid md:grid-cols-3 gap-px bg-black/[0.08]">
          {CARDS.map((card, i) => (
            <div
              key={card.num}
              className={`
                bg-surface p-8
                opacity-0
                ${inView ? "animate-fade-up" : ""}
              `}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Micro-chart */}
              <div className="mb-5 h-12">{card.chart}</div>

              {/* Number */}
              <div className="eyebrow mb-3">{card.num}</div>

              {/* Title */}
              <h3 className="font-sans text-[15px] font-semibold text-text leading-snug mb-3">
                {card.title}
              </h3>

              {/* Sub */}
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

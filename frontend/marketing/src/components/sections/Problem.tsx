"use client";

import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";

function FlatLineChart() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden="true">
      {/* Faint area under the flat line */}
      <path
        d="M 0,28 C 10,26 16,30 28,27 C 40,24 44,29 56,27 C 68,25 72,29 84,27 C 96,25 104,29 120,27 L 120,44 L 0,44 Z"
        fill="rgba(156,163,175,0.12)"
      />
      <path
        d="M 0,28 C 10,26 16,30 28,27 C 40,24 44,29 56,27 C 68,25 72,29 84,27 C 96,25 104,29 120,27"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text x="0" y="11" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="#9ca3af">P&L</text>
      <text x="0" y="19" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="rgba(0,0,0,0.28)">sin progreso</text>
    </svg>
  );
}

function WinFomoChart() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden="true">
      {/* Win rate general bar */}
      <rect x="0" y="6" width="2" height="20" rx="1" fill="rgba(47,172,102,0.25)" />
      <rect x="4" y="6" width="58" height="10" rx="1" fill="rgba(47,172,102,0.25)" />
      <text x="66" y="15" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="600" fill="#2fac66">58%</text>
      <text x="4" y="24" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="rgba(0,0,0,0.40)">Win rate</text>
      {/* FOMO bar */}
      <rect x="0" y="30" width="2" height="10" rx="1" fill="rgba(217,64,64,0.3)" />
      <rect x="4" y="30" width="19" height="10" rx="1" fill="rgba(217,64,64,0.2)" />
      <text x="27" y="39" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="600" fill="#d94040">19%</text>
      <text x="4" y="38" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="rgba(0,0,0,0.40)">FOMO</text>
    </svg>
  );
}

function DrawdownChart() {
  return (
    <svg viewBox="0 0 120 44" width="120" height="44" aria-hidden="true">
      {/* Drop fill */}
      <path
        d="M 52,14 C 62,22 68,32 78,36 C 88,36 96,28 110,20 L 110,44 L 52,44 Z"
        fill="rgba(217,64,64,0.10)"
      />
      {/* Main line going up then dropping */}
      <path
        d="M 0,32 C 10,30 18,28 30,22 C 40,17 46,16 52,14 C 62,22 68,32 78,36 C 88,36 96,28 110,20"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Red drop portion */}
      <path
        d="M 52,14 C 62,22 68,32 78,36 C 88,36 96,28 110,20"
        fill="none"
        stroke="#d94040"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="54" y="10" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#d94040">drawdown</text>
    </svg>
  );
}

export default function Problem() {
  const t = useTranslations("problem");
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  const CARDS = [
    { num: "01", title: t("card1.title"), sub: t("card1.sub"), chart: <FlatLineChart /> },
    { num: "02", title: t("card2.title"), sub: t("card2.sub"), chart: <WinFomoChart /> },
    { num: "03", title: t("card3.title"), sub: t("card3.sub"), chart: <DrawdownChart /> },
  ];

  return (
    <section className="bg-light py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="grid md:grid-cols-3 gap-px bg-black/[0.08]">
          {CARDS.map((card, i) => (
            <div
              key={card.num}
              className={`bg-surface p-8 opacity-0 ${inView ? "animate-fade-up" : ""}`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="mb-5 h-12">{card.chart}</div>
              <div className="eyebrow mb-3">{card.num}</div>
              <h2 className="font-sans text-[15px] font-semibold text-text leading-snug mb-3">
                {card.title}
              </h2>
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

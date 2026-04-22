"use client";

import { useInView } from "@/hooks/useInView";

function PnlCurveChart() {
  return (
    <svg viewBox="0 0 280 90" width="100%" height="90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ap-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2fac66" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2fac66" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 0,72 C 18,68 26,76 42,65 C 58,54 66,70 82,60 C 98,50 108,56 124,44 C 138,33 148,50 163,40 C 176,31 185,36 200,24 C 213,14 222,18 238,10 C 250,4 265,6 280,2 L 280,90 L 0,90 Z"
        fill="url(#ap-fill)"
      />
      <path
        d="M 0,72 C 18,68 26,76 42,65 C 58,54 66,70 82,60 C 98,50 108,56 124,44 C 138,33 148,50 163,40 C 176,31 185,36 200,24 C 213,14 222,18 238,10 C 250,4 265,6 280,2"
        fill="none"
        stroke="#2fac66"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const HEATMAP_PREVIEW: number[][] = [
  [0, 2, 0, 1, -1, 0, 0],
  [1, 0, 3, 0, 0, 2, 0],
  [0, 0, 1, 2, 0, 0, 3],
  [0, -1, 0, 1, 2, 0, 0],
  [2, 0, 0, 3, 0, 1, 0],
  [0, 1, 2, 0, 0, 2, 1],
  [1, 0, 0, 0, 3, 0, 2],
  [0, 2, 1, -1, 0, 1, 0],
];

function heatColor(v: number): string {
  if (v === 0) return "#303030";
  if (v === 1) return "rgba(47,172,102,0.25)";
  if (v === 2) return "rgba(47,172,102,0.55)";
  if (v === 3) return "#2fac66";
  if (v === -1) return "rgba(217,64,64,0.4)";
  return "#d94040";
}

function HeatmapChart() {
  return (
    <div className="flex gap-[3px]">
      {HEATMAP_PREVIEW.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((v, di) => (
            <div
              key={di}
              style={{
                width: 12,
                height: 12,
                borderRadius: "2px",
                background: heatColor(v),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const EMOTIONS = [
  { label: "Confiado", pct: 67, color: "#2fac66" },
  { label: "Neutral", pct: 52, color: "rgba(47,172,102,0.6)" },
  { label: "Incierto", pct: 31, color: "#9ca3af" },
  { label: "FOMO", pct: 19, color: "#d94040" },
];

function EmotionChart() {
  return (
    <div className="flex flex-col gap-3 w-full">
      {EMOTIONS.map((e) => (
        <div key={e.label} className="flex items-center gap-3">
          <span
            className="font-mono text-[9px] text-text-dark-secondary w-14 text-right flex-shrink-0"
          >
            {e.label}
          </span>
          <div className="flex-1 h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${e.pct}%`, background: e.color }}
            />
          </div>
          <span className="font-mono text-[9px] tabular-nums w-6 text-right flex-shrink-0"
            style={{ color: e.color }}>
            {e.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function DrawdownChart() {
  return (
    <svg viewBox="0 0 280 90" width="100%" height="90" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="dd-fill-good" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2fac66" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2fac66" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dd-fill-bad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d94040" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#d94040" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Normal area */}
      <path
        d="M 0,20 C 20,18 30,22 50,15 C 65,10 70,14 85,50 C 100,72 120,80 145,75 C 160,71 175,50 195,35 C 215,22 235,16 280,10 L 280,90 L 0,90 Z"
        fill="url(#dd-fill-good)"
      />
      {/* Drawdown highlighted area */}
      <path
        d="M 85,50 C 100,72 120,80 145,75 C 160,71 175,50 195,35 L 195,90 L 85,90 Z"
        fill="url(#dd-fill-bad)"
      />
      {/* Main line */}
      <path
        d="M 0,20 C 20,18 30,22 50,15 C 65,10 70,14 85,50 C 100,72 120,80 145,75 C 160,71 175,50 195,35 C 215,22 235,16 280,10"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Drawdown segment highlighted */}
      <path
        d="M 85,50 C 100,72 120,80 145,75 C 160,71 175,50 195,35"
        fill="none"
        stroke="#d94040"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="none"
      />
      {/* Label */}
      <text x="115" y="72" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="#f06060" textAnchor="middle">
        Max drawdown
      </text>
    </svg>
  );
}

const CHARTS = [
  {
    label: "Curva P&L",
    title: "Últimos 90 días",
    chart: <PnlCurveChart />,
    stat: "+€2.847",
    statLabel: "P&L acumulado",
    statColor: "#2fac66",
  },
  {
    label: "Actividad",
    title: "Heatmap · 8 semanas",
    chart: null, // rendered below
    isHeatmap: true,
    stat: "47",
    statLabel: "Operaciones",
    statColor: "#e8ebe8",
  },
  {
    label: "Win rate por emoción",
    title: "Breakdown conductual",
    chart: null, // rendered below
    isEmotion: true,
    stat: "38%",
    statLabel: "Diferencia FOMO vs Confiado",
    statColor: "#d94040",
  },
  {
    label: "Drawdown",
    title: "Máximo retroceso",
    chart: <DrawdownChart />,
    stat: "−€640",
    statLabel: "Drawdown máximo",
    statColor: "#f06060",
  },
];

export default function AnalyticsPreview() {
  const { ref, inView } = useInView<HTMLDivElement>(0.08);

  return (
    <section className="bg-dark py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-500 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="eyebrow mb-4">Tu rendimiento, en datos</p>
          <h2 className="font-sans text-[36px] font-bold text-text-dark-primary leading-[1.1] tracking-[-0.02em]">
            Los gráficos que los otros diarios no tienen.
          </h2>
          <p className="font-sans text-[16px] text-text-dark-secondary mt-3 max-w-[480px] mx-auto leading-relaxed">
            Todo filtrable. Todo interactivo. Todo basado en tus datos reales.
          </p>
        </div>

        {/* Chart grid */}
        <div
          ref={ref}
          className="grid sm:grid-cols-2 gap-px bg-white/[0.04]"
        >
          {CHARTS.map((item, i) => (
            <div
              key={item.label}
              className={`bg-dark2 p-6 opacity-0 ${inView ? "animate-fade-up" : ""}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Card header */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-mono text-[9px] text-text-dark-secondary uppercase tracking-[0.12em]">
                  {item.label}
                </span>
                <span className="font-mono text-[9px] text-text-dark-secondary opacity-60">
                  {item.title}
                </span>
              </div>

              {/* Stat */}
              <div className="flex items-end gap-2 mb-4">
                <span
                  className="font-mono text-[28px] font-semibold tracking-[-0.02em] tabular-nums leading-none"
                  style={{ color: item.statColor }}
                >
                  {item.stat}
                </span>
                <span className="font-mono text-[9px] text-text-dark-secondary mb-1">
                  {item.statLabel}
                </span>
              </div>

              {/* Chart */}
              <div className="w-full">
                {item.isHeatmap ? (
                  <HeatmapChart />
                ) : item.isEmotion ? (
                  <EmotionChart />
                ) : (
                  item.chart
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

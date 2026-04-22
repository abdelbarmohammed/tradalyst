import { BookOpen, BrainCircuit, Eye, BarChart2 } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Diario completo",
    desc: "Crypto, forex y acciones en un solo lugar. Razonamiento y estado emocional por operación.",
    badge: "CRUD completo",
    badgeStyle: "bg-black/[0.06] text-text-secondary",
    mini: (
      <div className="mt-5 space-y-[3px]">
        {[
          { pair: "BTC/USD", dir: "Long", pnl: "+€142", win: true },
          { pair: "ETH/USD", dir: "Short", pnl: "−€38", win: false },
          { pair: "EUR/USD", dir: "Long", pnl: "+€67", win: true },
        ].map((row) => (
          <div
            key={row.pair}
            className="flex items-center gap-2 px-2 py-[5px] bg-surface"
          >
            <span className="font-mono text-[9px] text-text-secondary w-12">{row.pair}</span>
            <span
              className={`font-mono text-[8px] px-[5px] py-[1px] rounded ${
                row.win ? "bg-green/10 text-green" : "bg-loss/10 text-loss"
              }`}
            >
              {row.dir}
            </span>
            <span
              className={`font-mono text-[9px] ml-auto tabular-nums ${
                row.win ? "text-green" : "text-loss"
              }`}
            >
              {row.pnl}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BrainCircuit,
    title: "IA conductual",
    desc: "Detecta FOMO, revenge trading y sobreoperar antes de que se conviertan en pérdidas crónicas.",
    badge: "Powered by Claude",
    badgeStyle: "bg-green/10 text-green",
    mini: (
      <div className="mt-5 p-3 bg-surface border border-black/[0.08]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-[5px] h-[5px] rounded-full bg-green animate-pulse-slow" />
          <span className="font-mono text-[8px] text-green uppercase tracking-wider">Insight</span>
        </div>
        <p className="font-sans text-[10px] text-text-secondary leading-relaxed">
          FOMO: 19% win rate · Confiado: 67% win rate
        </p>
      </div>
    ),
  },
  {
    icon: Eye,
    title: "Vista mentor",
    desc: "Asigna un mentor. Puede revisar y anotar tus operaciones — sin tocar tus datos.",
    badge: "Pro",
    badgeStyle: "bg-green text-white",
    mini: (
      <div className="mt-5 p-3 bg-surface">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-dark2 flex items-center justify-center">
            <span className="font-mono text-[7px] text-text-dark-primary">JM</span>
          </div>
          <span className="font-sans text-[10px] text-text-secondary">Juan Mentor</span>
          <span className="font-mono text-[8px] text-green ml-auto">activo</span>
        </div>
        <p className="font-mono text-[9px] text-text-muted leading-relaxed border-t border-black/[0.06] pt-2 mt-1">
          «Revisa el sizing en los trades de FOMO — está demasiado alto.»
        </p>
      </div>
    ),
  },
  {
    icon: BarChart2,
    title: "Dashboard de rendimiento",
    desc: "Curva P&L, heatmap, winrate y más. Todo filtrable.",
    badge: "Tiempo real",
    badgeStyle: "bg-black/[0.06] text-text-secondary",
    mini: (
      <div className="mt-5">
        <div className="flex gap-[2px] mb-2">
          {[40, 60, 35, 75, 55, 80, 65, 90, 70, 85, 60, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: h * 0.4,
                background: h > 60 ? "#2fac66" : "rgba(47,172,102,0.3)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[8px] text-text-muted">Ene</span>
          <span className="font-mono text-[8px] text-text-muted">Dic</span>
        </div>
      </div>
    ),
  },
];

export default function FeatureGrid() {
  return (
    <section className="bg-light py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">Funcionalidades</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            Todo lo que necesitas para operar mejor.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-black/[0.08]">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white p-8 group hover:-translate-y-[2px] hover:shadow-md transition-all duration-200"
              >
                {/* Icon + badge row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 flex items-center justify-center border border-black/[0.08]">
                    <Icon size={17} className="text-text-secondary" />
                  </div>
                  <span
                    className={`font-mono text-[9px] px-[10px] py-[4px] rounded uppercase tracking-[0.06em] ${feat.badgeStyle}`}
                  >
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-sans text-[17px] font-semibold text-text mb-2">
                  {feat.title}
                </h3>
                <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
                  {feat.desc}
                </p>

                {feat.mini}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

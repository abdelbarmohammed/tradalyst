import { useTranslations } from "next-intl";
import { BookOpen, BrainCircuit, Eye, BarChart2 } from "lucide-react";

export default function FeatureGrid() {
  const t = useTranslations("features");

  const FEATURES = [
    {
      icon: BookOpen,
      title: t("feature1.title"),
      desc: t("feature1.desc"),
      badge: t("feature1.badge"),
      badgeStyle: "text-[#4b5563] border-black/[0.15]",
      mini: (
        <div className="mt-5 space-y-[3px]">
          {[
            { pair: "BTC/USD", dir: "Long", pnl: "+€142", win: true },
            { pair: "ETH/USD", dir: "Short", pnl: "−€38", win: false },
            { pair: "EUR/USD", dir: "Long", pnl: "+€67", win: true },
          ].map((row) => (
            <div key={row.pair} className="flex items-center gap-2 px-2 py-[5px] bg-surface">
              <span className="font-mono text-[9px] text-text-secondary w-12">{row.pair}</span>
              <span className={`font-mono text-[8px] px-[5px] py-[1px] rounded ${row.win ? "bg-green/10 text-green" : "bg-loss/10 text-loss"}`}>
                {row.dir}
              </span>
              <span className={`font-mono text-[9px] ml-auto tabular-nums ${row.win ? "text-green" : "text-loss"}`}>
                {row.pnl}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: BrainCircuit,
      title: t("feature2.title"),
      desc: t("feature2.desc"),
      badge: t("feature2.badge"),
      badgeStyle: "text-green border-green/30 bg-green/[0.06]",
      mini: (
        <div className="mt-5 p-3 bg-surface border border-black/[0.08]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-[5px] h-[5px] rounded-full bg-green animate-pulse-slow" />
            <span className="font-mono text-[8px] text-green uppercase tracking-wider">{t("feature2.miniInsightLabel")}</span>
          </div>
          <p className="font-sans text-[10px] text-text-secondary leading-relaxed">
            {t("feature2.miniInsightText")}
          </p>
        </div>
      ),
    },
    {
      icon: Eye,
      title: t("feature3.title"),
      desc: t("feature3.desc"),
      badge: t("feature3.badge"),
      badgeStyle: "text-green border-green/30 bg-green/[0.06]",
      mini: (
        <div className="mt-5 p-3 bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-dark2 flex items-center justify-center">
              <span className="font-mono text-[7px] text-text-dark-primary">JM</span>
            </div>
            <span className="font-sans text-[10px] text-text-secondary">Juan Mentor</span>
            <span className="font-mono text-[8px] text-green ml-auto">{t("feature3.mentorActive")}</span>
          </div>
          <p className="font-mono text-[9px] text-text-muted leading-relaxed border-t border-black/[0.06] pt-2 mt-1">
            {t("feature3.mentorNote")}
          </p>
        </div>
      ),
    },
    {
      icon: BarChart2,
      title: t("feature4.title"),
      desc: t("feature4.desc"),
      badge: t("feature4.badge"),
      badgeStyle: "text-[#4b5563] border-black/[0.15]",
      mini: (
        <div className="mt-5">
          <div className="flex gap-[2px] mb-2">
            {[40, 60, 35, 75, 55, 80, 65, 90, 70, 85, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: h * 0.4, background: h > 60 ? "#2fac66" : "rgba(47,172,102,0.3)" }} />
            ))}
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-[8px] text-text-muted">{t("feature4.monthStart")}</span>
            <span className="font-mono text-[8px] text-text-muted">{t("feature4.monthEnd")}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-light py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            {t("heading")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-black/[0.08]">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-white p-8 group hover:-translate-y-[2px] hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 flex items-center justify-center border border-black/[0.08]">
                    <Icon size={17} className="text-text-secondary" />
                  </div>
                  <span className={`font-mono text-[9px] px-2 py-[3px] border rounded-[2px] uppercase tracking-[0.08em] ${feat.badgeStyle}`}>
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-sans text-[17px] font-semibold text-text mb-2">{feat.title}</h3>
                <p className="font-sans text-[14px] text-text-secondary leading-relaxed">{feat.desc}</p>
                {feat.mini}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

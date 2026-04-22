"use client";

import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    num: "01",
    action: "Registra",
    title: "Añade tu operación: activo, dirección, precio, resultado y razonamiento. 60 segundos.",
    tags: ["Crypto", "Forex", "Acciones"],
    tagColor: "bg-black/[0.06] text-text-secondary",
  },
  {
    num: "02",
    action: "Analiza",
    title: "La IA lee tu historial completo — números y texto — y detecta patrones de comportamiento.",
    tags: ["Claude AI", "Análisis conductual"],
    tagColor: "bg-green/10 text-green",
    hasInsightCard: true,
  },
  {
    num: "03",
    action: "Mejora",
    title: "Recibe insights semanales y habla con tu IA sobre tus operaciones de forma directa.",
    tags: ["Insights", "Chat IA"],
    tagColor: "bg-green/10 text-green",
  },
];

function MiniInsightCard() {
  return (
    <div className="mt-4 p-4 border border-black/[0.08] bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[6px] h-[6px] rounded-full bg-green animate-pulse-slow inline-block" />
        <span className="eyebrow text-[9px]">IA · Insight semanal</span>
      </div>
      <p className="font-sans text-[11px] text-text-secondary leading-relaxed">
        Tus operaciones del martes tienen un{" "}
        <span className="font-semibold text-green">38% mejor rendimiento</span> que el
        resto de la semana. Las marcadas como FOMO tienen 19% win rate.
      </p>
      <div className="flex gap-2 mt-3">
        <span className="font-mono text-[9px] px-2 py-[2px] border border-loss/50 text-loss">FOMO ↑</span>
        <span className="font-mono text-[9px] px-2 py-[2px] border border-green/50 text-green">Martes ★</span>
        <span className="font-mono text-[9px] px-2 py-[2px] border border-green/50 text-green">R:R ↗</span>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  return (
    <section id="how" className="bg-white py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`max-w-[520px] mb-16 transition-all duration-500 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="eyebrow mb-4">Cómo funciona</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            Tres pasos. Sin fricción.
          </h2>
          <p className="font-sans text-[16px] text-text-secondary mt-3 leading-relaxed">
            De la operación al insight en menos de 60 segundos.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="grid md:grid-cols-3 gap-10 lg:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`opacity-0 ${inView ? "animate-fade-up" : ""}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Step number circle */}
              <div
                className={`
                  w-10 h-10 rounded-full border-2 border-green flex items-center justify-center mb-5
                  transition-transform duration-300
                  ${inView ? "scale-100" : "scale-75"}
                `}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <span className="font-mono text-[11px] font-semibold text-green">
                  {step.num}
                </span>
              </div>

              {/* Action label */}
              <p className="font-mono text-[11px] font-semibold text-text uppercase tracking-[0.12em] mb-2">
                {step.action}
              </p>

              {/* Description */}
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed mb-4">
                {step.title}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-[10px] px-[10px] py-[4px] rounded ${step.tagColor}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Step 02 insight card */}
              {step.hasInsightCard && <MiniInsightCard />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

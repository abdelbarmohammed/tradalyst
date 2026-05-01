"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";

function MiniInsightCard() {
  const t = useTranslations("howItWorks");
  return (
    <div className="mt-4 p-4 border border-black/[0.08] bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[6px] h-[6px] rounded-full bg-green animate-pulse-slow inline-block" />
        <span className="eyebrow text-[9px]">{t("insightCard.label")}</span>
      </div>
      <p className="font-sans text-[11px] text-text-secondary leading-relaxed">
        {t("insightCard.text", { pct: t("insightCard.pct") })}
      </p>
      <div className="flex gap-2 mt-3">
        <span className="font-mono text-[9px] px-2 py-[2px] border border-loss/50 text-loss">FOMO ↑</span>
        <span className="font-mono text-[9px] px-2 py-[2px] border border-green/50 text-green">★</span>
        <span className="font-mono text-[9px] px-2 py-[2px] border border-green/50 text-green">R:R ↗</span>
      </div>
    </div>
  );
}

const STEP_PHOTOS = [
  { src: "/images/steps/step-register.webp", alt: "Manos escribiendo en el teclado de una laptop" },
  { src: "/images/steps/step-analyze.webp",  alt: "Persona analizando gráficos de trading en pantalla" },
  { src: "/images/steps/step-improve.webp",  alt: "Persona satisfecha mirando resultados en su laptop" },
];

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  const STEPS = [
    {
      num: "01",
      action: t("step1.action"),
      title: t("step1.title"),
      tags: [t("step1.tags.0"), t("step1.tags.1"), t("step1.tags.2")],
      tagColor: "bg-black/[0.06] text-text-secondary",
    },
    {
      num: "02",
      action: t("step2.action"),
      title: t("step2.title"),
      tags: [t("step2.tags.0"), t("step2.tags.1")],
      tagColor: "bg-green/10 text-green",
      hasInsightCard: true,
    },
    {
      num: "03",
      action: t("step3.action"),
      title: t("step3.title"),
      tags: [t("step3.tags.0"), t("step3.tags.1")],
      tagColor: "bg-green/10 text-green",
    },
  ];

  return (
    <section id="how" className="bg-white py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div
          className={`max-w-[520px] mb-16 transition-all duration-500 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            {t("heading")}
          </h2>
          <p className="font-sans text-[16px] text-text-secondary mt-3 leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div ref={ref} className="grid md:grid-cols-3 gap-10 lg:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`opacity-0 ${inView ? "animate-fade-up" : ""}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Contextual step photo */}
              <div className="relative h-[160px] mb-6 overflow-hidden">
                <Image
                  src={STEP_PHOTOS[i].src}
                  alt={STEP_PHOTOS[i].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>

              <div
                className={`w-10 h-10 rounded-full border-2 border-green flex items-center justify-center mb-5 transition-transform duration-300 ${
                  inView ? "scale-100" : "scale-75"
                }`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <span className="font-mono text-[11px] font-semibold text-green">{step.num}</span>
              </div>

              <p className="font-mono text-[11px] font-semibold text-text uppercase tracking-[0.12em] mb-2">
                {step.action}
              </p>

              <p className="font-sans text-[15px] text-text-secondary leading-relaxed mb-4">
                {step.title}
              </p>

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

              {step.hasInsightCard && <MiniInsightCard />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

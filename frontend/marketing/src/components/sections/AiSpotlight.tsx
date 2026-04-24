"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BrainCircuit, MessageSquare, Zap } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { APP_URL } from "@/lib/urls";

const CAPABILITY_ICONS = [BrainCircuit, MessageSquare, Zap];

export default function AiSpotlight() {
  const t = useTranslations("aiSpotlight");
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const [displayed, setDisplayed] = useState("");
  const [tagsVisible, setTagsVisible] = useState(false);

  const insightText = t("insightText");

  const TAGS = [
    { label: t("tags.0"), border: "rgba(217,64,64,0.5)", text: "#d94040" },
    { label: t("tags.1"), border: "rgba(47,172,102,0.5)", text: "#2fac66" },
    { label: t("tags.2"), border: "rgba(47,172,102,0.5)", text: "#2fac66" },
    { label: t("tags.3"), border: "rgba(0,0,0,0.18)", text: "#6b7280" },
  ];

  const CAPABILITIES = [
    { icon: CAPABILITY_ICONS[0], title: t("capability1.title"), desc: t("capability1.desc") },
    { icon: CAPABILITY_ICONS[1], title: t("capability2.title"), desc: t("capability2.desc") },
    { icon: CAPABILITY_ICONS[2], title: t("capability3.title"), desc: t("capability3.desc") },
  ];

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    setDisplayed("");
    setTagsVisible(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(insightText.slice(0, i));
      if (i >= insightText.length) {
        clearInterval(interval);
        setTimeout(() => setTagsVisible(true), 300);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [inView, insightText]);

  return (
    <section className="bg-dark py-24 lg:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
        <div
          className={`text-center mb-14 transition-all duration-500 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-sans text-[36px] font-bold text-text-dark-primary leading-[1.1] tracking-[-0.02em]">
            {t("heading")}
          </h2>
        </div>

        <div ref={ref} className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">
          {/* Left — typewriter insight card */}
          <div
            className={`transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="p-7" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse-slow" />
                <span className="font-mono text-[10px] text-green uppercase tracking-[0.12em]">
                  {t("insightLabel")}
                </span>
                <span className="font-mono text-[10px] text-text-muted ml-auto">
                  {t("insightTime")}
                </span>
              </div>

              <p className="font-sans text-[15px] text-text-secondary leading-relaxed min-h-[120px]">
                {displayed}
                {displayed.length < insightText.length && inView && (
                  <span className="inline-block w-[2px] h-[1em] bg-green ml-[1px] animate-pulse-slow" />
                )}
              </p>

              <div
                className={`flex flex-wrap gap-2 mt-6 transition-all duration-500 ${
                  tagsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="font-mono text-[10px] px-[10px] py-[4px]"
                    style={{ border: `1px solid ${tag.border}`, color: tag.text }}
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

            <div
              className={`mt-2 transition-all duration-500 delay-500 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <a
                href={`${APP_URL}/registro`}
                className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[11px] rounded transition-colors duration-150"
              >
                {t("cta")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

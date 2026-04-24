"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const AVATAR_STYLES = [
  { bg: "#2fac66", text: "#ffffff", initials: "JM" },
  { bg: "#272727", text: "#e8ebe8", initials: "SL" },
  { bg: "#f5f6f2", text: "#0f1110", initials: "MA" },
  { bg: "#2fac66", text: "#ffffff", initials: "LG" },
  { bg: "#303030", text: "#e8ebe8", initials: "PT" },
  { bg: "#eceee8", text: "#0f1110", initials: "ER" },
];

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [paused, setPaused] = useState(false);

  const TESTIMONIALS = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    ...AVATAR_STYLES[i],
    name: t(`t${n}.name`),
    role: t(`t${n}.role`),
    quote: t(`t${n}.quote`),
  }));

  const ALL = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="bg-surface py-24 lg:py-32 border-t border-black/[0.08] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 mb-12">
        <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em] text-center">
          {t("heading")}
        </h2>
      </div>

      <div
        className="relative fade-edges"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-4 w-max"
          style={{ animation: "scroll 28s linear infinite", animationPlayState: paused ? "paused" : "running" }}
        >
          {ALL.map((t, i) => (
            <div key={i} className="bg-white border border-black/[0.08] p-7 flex-shrink-0" style={{ width: 340 }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{ background: t.bg, borderRadius: "2px" }}
                >
                  <span className="font-mono text-[11px] font-semibold" style={{ color: t.text }}>
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="font-sans text-[13px] font-semibold text-text leading-none">{t.name}</p>
                  <p className="font-mono text-[9px] text-text-muted mt-[3px]">{t.role}</p>
                </div>
              </div>
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

"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [paused, setPaused] = useState(false);

  const TESTIMONIALS = [1, 2, 3, 4, 5, 6].map((n) => ({
    name: t(`t${n}.name`),
    role: t(`t${n}.role`),
    quote: t(`t${n}.quote`),
  }));

  const ALL = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="bg-surface py-24 lg:py-32 border-t border-black/[0.08] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-12">
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
          {ALL.map((item, i) => (
            <div key={i} className="bg-white border border-black/[0.08] p-7 flex-shrink-0" style={{ width: 340 }}>
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src={`/images/people/testimonial-0${(i % TESTIMONIALS.length) + 1}.webp`}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-sans text-[13px] font-semibold text-text leading-none">{item.name}</p>
                  <p className="font-mono text-[9px] text-text-muted mt-[3px]">{item.role}</p>
                </div>
              </div>
              <p className="font-sans text-[13px] text-text-secondary leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

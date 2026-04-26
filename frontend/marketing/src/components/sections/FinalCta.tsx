"use client";

import { useTranslations, useLocale } from "next-intl";
import { useInView } from "@/hooks/useInView";
import { APP_URL } from "@/lib/urls";

export default function FinalCta() {
  const t = useTranslations("finalCta");
  const locale = useLocale();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <section className="relative py-28 lg:py-36 overflow-hidden" style={{ background: "#1e1e1e" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(47,172,102,0.18) 0%, transparent 70%)" }}
      />

      <div ref={ref} className="relative max-w-[760px] mx-auto px-6 lg:px-10 text-center">
        <h2
          className={`font-sans text-[36px] lg:text-[44px] font-bold text-text-dark-primary leading-[1.1] tracking-[-0.02em] mb-5 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {t("heading")}
        </h2>

        <p
          className={`font-sans text-[16px] text-text-dark-secondary leading-relaxed mb-10 transition-all duration-700 delay-150 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {t("description")}
        </p>

        <div
          className={`transition-all duration-700 delay-300 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href={`${APP_URL}/registro?lang=${locale}`}
            className="inline-block font-sans text-[15px] font-semibold bg-green hover:bg-green-hover text-white px-8 py-[14px] rounded transition-colors duration-150"
          >
            {t("cta")}
          </a>
        </div>
      </div>
    </section>
  );
}

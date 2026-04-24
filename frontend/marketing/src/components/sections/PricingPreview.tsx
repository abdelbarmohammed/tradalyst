"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInView } from "@/hooks/useInView";
import { APP_URL } from "@/lib/urls";

export default function PricingPreview() {
  const t = useTranslations("pricing");
  const { ref, inView } = useInView<HTMLDivElement>(0.1);

  const FREE_FEATURES = [
    { key: "free1", included: true },
    { key: "free2", included: true },
    { key: "free3", included: true },
    { key: "free4", included: true },
    { key: "free5", included: false },
    { key: "free6", included: false },
    { key: "free7", included: false },
  ];

  const PRO_FEATURES = [
    "pro1", "pro2", "pro3", "pro4", "pro5", "pro6", "pro7",
  ];

  return (
    <section className="bg-light py-24 lg:py-32 border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h2 className="font-sans text-[36px] font-bold text-text leading-[1.1] tracking-[-0.02em]">
            {t("heading")}
          </h2>
          <p className="font-sans text-[16px] text-text-secondary mt-3 leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-4 max-w-[760px] mx-auto">
          {/* Free */}
          <div
            className={`bg-white border border-black/[0.08] p-8 transition-all duration-500 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted mb-3">{t("free.label")}</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-mono text-[42px] font-bold text-text tracking-[-0.03em] leading-none">{t("free.price")}</span>
            </div>
            <p className="font-mono text-[11px] text-text-muted mb-7">{t("free.period")}</p>
            <p className="font-sans text-[13px] text-text-secondary mb-7 leading-relaxed">{t("free.description")}</p>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f.key} className="flex items-start gap-3">
                  {f.included ? (
                    <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                  ) : (
                    <X size={14} className="text-text-muted mt-[1px] flex-shrink-0" />
                  )}
                  <span className={`font-sans text-[13px] leading-snug ${f.included ? "text-text-secondary" : "text-text-muted"}`}>
                    {t(`features.${f.key}`)}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={`${APP_URL}/registro`}
              className="block w-full text-center font-sans text-sm font-semibold border border-black/[0.15] hover:border-black/[0.25] text-text px-5 py-[11px] rounded transition-colors duration-150"
            >
              {t("free.cta")}
            </a>
          </div>

          {/* Pro */}
          <div
            className={`bg-dark border border-green/40 p-8 relative transition-all duration-500 delay-100 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.95]"
            }`}
          >
            <div className="absolute -top-[11px] left-1/2 -translate-x-1/2">
              <span className="font-mono text-[9px] bg-green text-white px-3 py-[4px] uppercase tracking-[0.1em]">
                {t("pro.badge")}
              </span>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-green mb-3">{t("pro.label")}</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-mono text-[42px] font-bold text-text-dark-primary tracking-[-0.03em] leading-none">{t("pro.price")}</span>
            </div>
            <p className="font-mono text-[11px] text-text-dark-secondary mb-7">{t("pro.period")}</p>
            <p className="font-sans text-[13px] text-text-dark-secondary mb-7 leading-relaxed">{t("pro.description")}</p>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                  <span className="font-sans text-[13px] text-text-dark-primary leading-snug">
                    {t(`features.${key}`)}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={`${APP_URL}/registro`}
              className="block w-full text-center font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[11px] rounded transition-colors duration-150"
            >
              {t("pro.cta")}
            </a>
          </div>
        </div>

        <p className="text-center mt-7 font-mono text-[11px] text-text-muted">
          {t("moreLink")}{" "}
          <Link href="/precios" className="text-green hover:underline">
            {t("fullComparison")}
          </Link>
        </p>
      </div>
    </section>
  );
}

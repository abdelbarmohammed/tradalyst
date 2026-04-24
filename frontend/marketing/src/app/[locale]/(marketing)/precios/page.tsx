"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_URL } from "@/lib/urls";

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={15} className="text-green mx-auto" />;
  if (value === false) return <X size={15} className="text-text-muted mx-auto" />;
  return <span className="font-mono text-[11px] text-text-secondary">{value}</span>;
}

export default function PreciosPage() {
  const t = useTranslations("pricingPage");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FREE_FEATURES = [
    { key: "free1", included: true }, { key: "free2", included: true },
    { key: "free3", included: true }, { key: "free4", included: true },
    { key: "free5", included: false }, { key: "free6", included: false },
    { key: "free7", included: false },
  ];

  const PRO_FEATURES = ["pro1", "pro2", "pro3", "pro4", "pro5", "pro6", "pro7"];

  const pt = useTranslations("pricing");

  const TABLE_GROUPS = [
    {
      category: t("table.categories.journal"),
      rows: [
        { key: "unlimitedTrades", free: true as boolean | string, pro: true as boolean | string },
        { key: "allAssets", free: true, pro: true },
        { key: "emotionReasoning", free: true, pro: true },
        { key: "fullHistory", free: true, pro: true },
      ],
    },
    {
      category: t("table.categories.ai"),
      rows: [
        { key: "weeklyInsights", free: t("table.rows.weeklyInsightsFree") as boolean | string, pro: t("table.rows.weeklyInsightsPro") as boolean | string },
        { key: "aiChat", free: false as boolean | string, pro: true as boolean | string },
        { key: "behavioralAnalysis", free: false, pro: true },
      ],
    },
    {
      category: t("table.categories.analytics"),
      rows: [
        { key: "basicDashboard", free: true as boolean | string, pro: true as boolean | string },
        { key: "pnlCurve", free: false, pro: true },
        { key: "heatmap", free: false, pro: true },
        { key: "breakdown", free: false, pro: true },
      ],
    },
    {
      category: t("table.categories.mentor"),
      rows: [
        { key: "mentorView", free: false as boolean | string, pro: true as boolean | string },
        { key: "annotations", free: false, pro: true },
      ],
    },
    {
      category: t("table.categories.prices"),
      rows: [
        { key: "cryptoPrices", free: true as boolean | string, pro: true as boolean | string },
        { key: "forexPrices", free: false, pro: true },
      ],
    },
  ];

  const FAQ_KEYS = [1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-light min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[760px] mx-auto px-6 lg:px-10 text-center">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em] mb-4">
            {t("heading")}
          </h1>
        </div>
      </section>

      {/* Plan cards */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[860px] mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="bg-white border border-black/[0.08] p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted mb-3">{t("free.label")}</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-mono text-[48px] font-bold text-text tracking-[-0.03em] leading-none">{t("free.price")}</span>
              </div>
              <p className="font-mono text-[11px] text-text-muted mb-4">{t("free.period")}</p>
              <p className="font-sans text-[13px] text-text-secondary mb-7 leading-relaxed">{t("free.description")}</p>
              <ul className="space-y-[10px] mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f.key} className="flex items-start gap-3">
                    {f.included ? (
                      <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                    ) : (
                      <X size={14} className="text-text-muted mt-[1px] flex-shrink-0" />
                    )}
                    <span className={`font-sans text-[13px] leading-snug ${f.included ? "text-text-secondary" : "text-text-muted"}`}>
                      {pt(`features.${f.key}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={`${APP_URL}/registro`}
                className="block w-full text-center font-sans text-sm font-semibold border border-black/[0.15] hover:border-black/[0.3] text-text px-5 py-3 rounded transition-colors duration-150"
              >
                {t("free.cta")}
              </a>
            </div>

            {/* Pro */}
            <div className="bg-dark border border-green/40 p-8 relative">
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2">
                <span className="font-mono text-[9px] bg-green text-white px-3 py-[4px] uppercase tracking-[0.1em]">
                  {t("pro.badge")}
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-green mb-3">{t("pro.label")}</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-mono text-[48px] font-bold text-text-dark-primary tracking-[-0.03em] leading-none">{t("pro.price")}</span>
              </div>
              <p className="font-mono text-[11px] text-text-dark-secondary mb-4">{t("pro.period")}</p>
              <p className="font-sans text-[13px] text-text-dark-secondary mb-7 leading-relaxed">{t("pro.description")}</p>
              <ul className="space-y-[10px] mb-8">
                {PRO_FEATURES.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Check size={14} className="text-green mt-[1px] flex-shrink-0" />
                    <span className="font-sans text-[13px] text-text-dark-primary leading-snug">
                      {pt(`features.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={`${APP_URL}/registro`}
                className="block w-full text-center font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-3 rounded transition-colors duration-150"
              >
                {t("pro.cta")}
              </a>
              <p className="font-mono text-[10px] text-text-dark-secondary text-center mt-3">
                {t("pro.trial")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 lg:py-20 border-t border-black/[0.08]">
        <div className="max-w-[860px] mx-auto px-6 lg:px-10">
          <div className="border border-black/[0.08] overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_100px] bg-dark">
              <div className="p-4" />
              <div className="p-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dark-secondary">{t("table.free")}</span>
              </div>
              <div className="p-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-green">{t("table.pro")}</span>
              </div>
            </div>

            {TABLE_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="grid grid-cols-[1fr_100px_100px] bg-black/[0.03] border-t border-black/[0.08]">
                  <div className="px-4 py-2 col-span-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">{group.category}</span>
                  </div>
                </div>
                {group.rows.map((row, ri) => (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[1fr_100px_100px] border-t border-black/[0.06] ${ri % 2 === 0 ? "bg-white" : "bg-light/50"}`}
                  >
                    <div className="px-4 py-3">
                      <span className="font-sans text-[13px] text-text-secondary">{t(`table.rows.${row.key}`)}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-center"><Cell value={row.free} /></div>
                    <div className="px-4 py-3 flex items-center justify-center"><Cell value={row.pro} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 border-t border-black/[0.08]">
        <div className="max-w-[680px] mx-auto px-6 lg:px-10">
          <h2 className="font-sans text-[26px] font-bold text-text tracking-[-0.02em] mb-10">
            {t("faq.heading")}
          </h2>
          <div className="divide-y divide-black/[0.06]">
            {FAQ_KEYS.map((n) => (
              <div key={n}>
                <button
                  onClick={() => setOpenFaq(openFaq === n ? null : n)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-sans text-[15px] font-semibold text-text leading-snug">
                    {t(`faq.q${n}`)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-text-muted flex-shrink-0 transition-transform duration-200 ${openFaq === n ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === n && (
                  <p className="font-sans text-[14px] text-text-secondary leading-relaxed pb-5">
                    {t(`faq.a${n}`)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-24 border-t border-black/[0.08]" style={{ background: "#1e1e1e" }}>
        <div className="max-w-[640px] mx-auto px-6 lg:px-10 text-center">
          <p className="font-sans text-[22px] lg:text-[28px] font-bold text-text-dark-primary leading-[1.2] tracking-[-0.02em] mb-8">
            {t("finalCta")}
          </p>
          <a
            href={`${APP_URL}/registro`}
            className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-7 py-3 rounded transition-colors duration-150"
          >
            {t("free.cta")}
          </a>
        </div>
      </section>
    </div>
  );
}

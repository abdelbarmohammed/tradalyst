"use client";

import { useTranslations, useLocale } from "next-intl";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

function StatItem({
  value,
  label,
  inView,
}: {
  value: string;
  label: string;
  inView: boolean;
}) {
  return (
    <div className={`text-center transition-all duration-500 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <div className="font-mono text-[22px] font-semibold text-text tracking-[-0.02em] tabular-nums">
        {value}
      </div>
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.12em] mt-1">
        {label}
      </div>
    </div>
  );
}

export default function TrustBar() {
  const t = useTranslations("trustBar");
  const locale = useLocale();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const traders = useCountUp(2400, 1200, inView);
  const operations = useCountUp(180000, 1500, inView);

  function fmt(n: number) {
    return n.toLocaleString(locale === "en" ? "en-US" : "es-ES");
  }

  return (
    <div ref={ref} className="bg-white border-y border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-black/[0.06]">
          <StatItem value={`${fmt(traders)}+`} label={t("traders")} inView={inView} />
          <StatItem value={`${fmt(operations)}+`} label={t("operations")} inView={inView} />
          <div className={`text-center transition-all duration-500 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <div className="font-mono text-[22px] font-semibold text-text tracking-[-0.02em]">Claude</div>
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.12em] mt-1">{t("aiEngine")}</div>
          </div>
          <div className={`text-center transition-all duration-500 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <div className="font-mono text-[22px] font-semibold text-text tracking-[-0.02em]">4,9★</div>
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-[0.12em] mt-1">{t("rating")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

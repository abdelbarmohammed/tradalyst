"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loadGA } from "@/components/analytics/GoogleAnalytics";

export default function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    const id = process.env.NEXT_PUBLIC_GA_ID;
    if (id) loadGA(id);
  }

  function handleReject() {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-text animate-slide-up">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-sans text-[13px] text-text-dark-primary leading-relaxed">
          {t("before")}
          <Link href="/cookies" className="text-green underline hover:no-underline transition-all">
            {t("linkText")}
          </Link>
          {t("after")}
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleReject}
            className="font-sans text-[13px] font-semibold px-5 py-[9px] border border-white/30 text-white/80 hover:border-white hover:text-white transition-colors duration-150"
          >
            {t("reject")}
          </button>
          <button
            onClick={handleAccept}
            className="font-sans text-[13px] font-semibold px-5 py-[9px] bg-green hover:bg-green-hover text-white transition-colors duration-150"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

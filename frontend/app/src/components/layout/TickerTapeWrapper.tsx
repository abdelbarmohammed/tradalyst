"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import TickerTape from "@/components/dashboard/TickerTape";

export default function TickerTapeWrapper() {
  const locale = useLocale();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const update = () => {
      setTheme(
        document.documentElement.classList.contains("light") ? "light" : "dark"
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <TickerTape theme={theme} locale={locale} />;
}

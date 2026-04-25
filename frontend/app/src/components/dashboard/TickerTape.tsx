"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  theme?: "light" | "dark";
  locale?: string;
}

export default function TickerTape({ theme = "dark", locale = "es" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoaded(false);
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "BINANCE:SOLUSDT", title: "Solana" },
        { proName: "BINANCE:BNBUSDT", title: "BNB" },
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: theme,
      locale,
    });

    script.onload = () => setLoaded(true);

    container.appendChild(wrapper);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [theme, locale]);

  return (
    <div style={{ height: 46, overflow: "hidden" }}>
      {!loaded && (
        <div
          className="skeleton w-full"
          style={{ height: 46 }}
        />
      )}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: 46, opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
      />
    </div>
  );
}

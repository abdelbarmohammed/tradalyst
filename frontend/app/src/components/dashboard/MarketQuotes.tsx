"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  theme?: "light" | "dark";
  locale?: string;
}

export default function MarketQuotes({ theme = "dark", locale = "es" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoaded(false);
    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 250,
      symbolsGroups: [
        {
          name: "Crypto",
          symbols: [
            { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
            { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
            { name: "BINANCE:SOLUSDT", displayName: "Solana" },
            { name: "BINANCE:BNBUSDT", displayName: "BNB" },
          ],
        },
        {
          name: "Forex",
          symbols: [
            { name: "FX:EURUSD", displayName: "EUR/USD" },
            { name: "FX:GBPUSD", displayName: "GBP/USD" },
            { name: "FX:USDJPY", displayName: "USD/JPY" },
          ],
        },
        {
          name: "Acciones",
          symbols: [
            { name: "NASDAQ:AAPL", displayName: "Apple" },
            { name: "NASDAQ:TSLA", displayName: "Tesla" },
            { name: "NASDAQ:NVDA", displayName: "NVIDIA" },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: theme,
      locale,
    });

    script.onload = () => setLoaded(true);

    container.appendChild(widget);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [theme, locale]);

  return (
    <div style={{ height: 250 }}>
      {!loaded && (
        <div className="skeleton w-full rounded-sm" style={{ height: 250 }} />
      )}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: 250, opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
      />
    </div>
  );
}

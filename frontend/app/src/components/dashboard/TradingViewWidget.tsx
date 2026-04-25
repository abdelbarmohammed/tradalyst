"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  theme?: "light" | "dark";
  locale?: string;
}

export default function TradingViewWidget({ theme = "dark", locale = "es" }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: theme,
      dateRange: "1D",
      showChart: true,
      locale,
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "100%",
      plotLineColorGrowing: "#2fac66",
      plotLineColorFalling: "#f06060",
      gridLineColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      scaleFontColor: theme === "dark" ? "#6b7280" : "#9ca3af",
      belowLineFillColorGrowing: "rgba(47,172,102,0.08)",
      belowLineFillColorFalling: "rgba(240,96,96,0.08)",
      belowLineFillColorGrowingBottom: "rgba(47,172,102,0)",
      belowLineFillColorFallingBottom: "rgba(240,96,96,0)",
      symbolActiveColor: "rgba(47,172,102,0.12)",
      tabs: [
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
            { s: "BINANCE:XRPUSDT", d: "XRP" },
          ],
          originalTitle: "Crypto",
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX:AUDUSD", d: "AUD/USD" },
            { s: "FX:USDCHF", d: "USD/CHF" },
          ],
          originalTitle: "Forex",
        },
        {
          title: "Acciones",
          symbols: [
            { s: "NASDAQ:AAPL", d: "Apple" },
            { s: "NASDAQ:MSFT", d: "Microsoft" },
            { s: "NYSE:NVDA", d: "NVIDIA" },
            { s: "NASDAQ:TSLA", d: "Tesla" },
            { s: "NASDAQ:AMZN", d: "Amazon" },
          ],
          originalTitle: "Acciones",
        },
      ],
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [theme, locale]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: "440px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

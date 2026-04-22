"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { get } from "@/lib/api";
import { formatPctChange } from "@/lib/format";
import type { PricesResponse } from "@/types";

const DEFAULT_SYMBOLS = ["BTC", "ETH"];
const REFRESH_INTERVAL = 60_000; // 60 seconds

interface Props {
  symbols?: string[];
}

function Sparkline({ change }: { change: number }) {
  // Simple directional 2-point sparkline based on 24h change
  const up = change >= 0;
  const color = up ? "#2fac66" : "#f06060";
  const d = up ? "M 0,12 L 28,4" : "M 0,4 L 28,12";
  return (
    <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function PricesStrip({ symbols = DEFAULT_SYMBOLS }: Props) {
  const [prices, setPrices] = useState<PricesResponse>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchPrices() {
    try {
      const data = await get<PricesResponse>(
        `/api/prices/?symbols=${symbols.join(",")}`,
      );
      setPrices(data);
      setLastUpdated(new Date());
      setElapsed(0);
    } catch {
      // Silently fail — prices are not critical path
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();

    intervalRef.current = setInterval(fetchPrices, REFRESH_INTERVAL);

    // Tick elapsed counter every second
    elapsedRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  const hasPrices = Object.keys(prices).length > 0;

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Asset cards */}
        {loading
          ? symbols.map((s) => (
              <div key={s} className="skeleton flex-shrink-0 h-11 w-28 rounded-sm" />
            ))
          : symbols.map((symbol) => {
              const q = prices[symbol];
              if (!q || q.price == null) return null;
              const change = q.change_24h ?? 0;
              const isUp = change >= 0;
              return (
                <div
                  key={symbol}
                  className="flex-shrink-0 flex items-center gap-3 bg-elevated px-3 py-2"
                >
                  <div>
                    <p className="font-sans text-[11px] font-semibold text-primary leading-none mb-[3px]">
                      {symbol}
                    </p>
                    <p className="font-mono text-[12px] tabular-nums text-primary leading-none">
                      ${q.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-[2px]">
                    <Sparkline change={change} />
                    <span
                      className={`font-mono text-[9px] tabular-nums ${
                        isUp ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatPctChange(change)}
                    </span>
                  </div>
                </div>
              );
            })}

        {/* Add button */}
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-elevated hover:bg-white/[0.1] transition-colors duration-150"
          title="Añadir activo"
          aria-label="Añadir activo al panel"
        >
          <Plus size={14} className="text-secondary" />
        </button>
      </div>

      {/* Timestamp */}
      {hasPrices && lastUpdated && (
        <p className="font-mono text-[9px] text-muted mt-2">
          {elapsed < 5
            ? "Actualizado ahora"
            : `Actualizado hace ${elapsed}s`}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Settings, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { get, patch } from "@/lib/api";
import type { UserProfile } from "@/types";

// ── Asset map: user-facing symbol → TradingView symbol ────────────────────────

const ASSET_MAP: Record<string, string> = {
  // Crypto
  "BTC":    "BINANCE:BTCUSDT",
  "ETH":    "BINANCE:ETHUSDT",
  "SOL":    "BINANCE:SOLUSDT",
  "BNB":    "BINANCE:BNBUSDT",
  "XRP":    "BINANCE:XRPUSDT",
  "ADA":    "BINANCE:ADAUSDT",
  "AVAX":   "BINANCE:AVAXUSDT",
  "DOT":    "BINANCE:DOTUSDT",
  "MATIC":  "BINANCE:MATICUSDT",
  // Forex
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "USD/JPY": "FX:USDJPY",
  "USD/CHF": "FX:USDCHF",
  "AUD/USD": "FX:AUDUSD",
  "USD/CAD": "FX:USDCAD",
  "NZD/USD": "FX:NZDUSD",
  // Stocks
  "AAPL":  "NASDAQ:AAPL",
  "TSLA":  "NASDAQ:TSLA",
  "NVDA":  "NASDAQ:NVDA",
  "MSFT":  "NASDAQ:MSFT",
  "GOOGL": "NASDAQ:GOOGL",
  "AMZN":  "NASDAQ:AMZN",
  "META":  "NASDAQ:META",
  "NFLX":  "NASDAQ:NFLX",
  "AMD":   "NASDAQ:AMD",
  "INTC":  "NASDAQ:INTC",
};

const ALL_ASSETS = Object.keys(ASSET_MAP);
const DEFAULT_ASSETS = ["BTC", "ETH", "EUR/USD", "AAPL"];
const MAX_ASSETS = 8;
const WIDGET_HEIGHT = 250;

// ── Manage modal ──────────────────────────────────────────────────────────────

function ManageModal({
  assets,
  onSave,
  onClose,
  saving,
}: {
  assets: string[];
  onSave: (next: string[]) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const t = useTranslations("watchlist");
  const [draft, setDraft] = useState<string[]>(assets);
  const [search, setSearch] = useState("");

  const suggestions = search.trim().length > 0
    ? ALL_ASSETS.filter(
        (a) =>
          a.toLowerCase().includes(search.toLowerCase()) &&
          !draft.includes(a)
      ).slice(0, 8)
    : [];

  function add(symbol: string) {
    if (draft.length >= MAX_ASSETS || draft.includes(symbol)) return;
    setDraft((prev) => [...prev, symbol]);
    setSearch("");
  }

  function remove(symbol: string) {
    setDraft((prev) => prev.filter((s) => s !== symbol));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("modalTitle")}
          </p>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X size={14} />
          </button>
        </div>

        {/* Current assets */}
        <div className="flex flex-wrap gap-2">
          {draft.map((sym) => (
            <div
              key={sym}
              className="flex items-center gap-1 bg-base border border-white/[0.08] px-2 py-[4px]"
            >
              <span className="font-mono text-[11px] text-primary">{sym}</span>
              <button
                onClick={() => remove(sym)}
                className="text-muted hover:text-loss transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* Counter */}
        <p className="font-mono text-[10px] text-muted">
          {draft.length}/{MAX_ASSETS}
        </p>

        {/* Search */}
        {draft.length < MAX_ASSETS && (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-base border border-white/[0.10] px-3 py-[8px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-elevated border border-white/[0.08] border-t-0 z-10">
                {suggestions.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => add(sym)}
                    className="w-full text-left px-3 py-[7px] font-mono text-[12px] text-secondary hover:text-primary hover:bg-white/[0.03] transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={saving || draft.length === 0}
            className="flex-1 font-sans text-[13px] font-semibold px-4 py-[9px] bg-green hover:bg-green-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  theme?: "light" | "dark";
  locale?: string;
}

export default function MarketQuotes({ theme = "dark", locale = "es" }: Props) {
  const t = useTranslations("watchlist");
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [pinnedAssets, setPinnedAssets] = useState<string[]>(DEFAULT_ASSETS);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildWidget = useCallback((assets: string[], currentTheme: string, currentLocale: string) => {
    const container = containerRef.current;
    if (!container) return;

    setLoaded(false);
    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: WIDGET_HEIGHT,
      symbolsGroups: [
        {
          name: "Watchlist",
          symbols: assets.map((sym) => ({
            name: ASSET_MAP[sym] ?? sym,
            displayName: sym,
          })),
        },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: currentTheme,
      locale: currentLocale,
    });

    script.onload = () => setLoaded(true);
    container.appendChild(widget);
    container.appendChild(script);
  }, []);

  useEffect(() => {
    get<UserProfile>("/api/users/me/")
      .then((profile) => {
        const assets = profile.pinned_assets && profile.pinned_assets.length > 0
          ? profile.pinned_assets
          : DEFAULT_ASSETS;
        setPinnedAssets(assets);
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  useEffect(() => {
    buildWidget(pinnedAssets, theme, locale);
    const container = containerRef.current;
    return () => {
      if (container) container.innerHTML = "";
    };
  }, [pinnedAssets, theme, locale, buildWidget]);

  async function handleSave(next: string[]) {
    setSaving(true);
    try {
      await patch<UserProfile>("/api/users/me/", { pinned_assets: next });
      setPinnedAssets(next);
      setShowModal(false);
    } catch {
      // Keep modal open on error
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {showModal && (
        <ManageModal
          assets={pinnedAssets}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}

      <div style={{ height: WIDGET_HEIGHT }}>
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t("title")}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 font-mono text-[10px] text-muted hover:text-secondary transition-colors"
          >
            <Settings size={10} />
            {t("manage")}
          </button>
        </div>
        {!loaded && (
          <div className="skeleton w-full rounded-sm" style={{ height: WIDGET_HEIGHT - 24 }} />
        )}
        <div
          ref={containerRef}
          className="tradingview-widget-container"
          style={{ height: WIDGET_HEIGHT - 24, opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
        />
      </div>
    </>
  );
}

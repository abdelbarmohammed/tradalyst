/**
 * Number and date formatters for the app.
 * All monetary values and statistics use IBM Plex Mono — apply font-mono
 * to any element that renders output from these functions.
 */

// ── Currency ──────────────────────────────────────────────────────────────────

const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format P&L value in EUR with sign prefix: "+€142,00" / "−€38,00" */
export function formatPnl(value: number): string {
  const abs = EUR.format(Math.abs(value));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs.slice(1)}`; // replace minus sign with proper dash
  return abs;
}

/** Format a plain currency amount in EUR: "€9.999,00" */
export function formatEur(value: number): string {
  return EUR.format(value);
}

/** Format a crypto/forex price in USD with variable precision */
export function formatPrice(value: number, decimals = 2): string {
  if (value >= 1000) decimals = 2;
  else if (value >= 1) decimals = 4;
  else decimals = 6;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ── Percentages ───────────────────────────────────────────────────────────────

/** Format win rate or % change: "67,4%" */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

/** Format a percentage change with sign: "+12,3%" / "−4,1%" */
export function formatPctChange(value: number): string {
  const formatted = formatPct(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

// ── Ratios and counts ─────────────────────────────────────────────────────────

/** Format R:R ratio: "1,8" */
export function formatRR(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** Format a plain integer count: "1.247" (ES thousands separator) */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("es-ES").format(value);
}

// ── Dates ─────────────────────────────────────────────────────────────────────

const DATE_SHORT = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_MEDIUM = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIME = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "22/04/2026" */
export function formatDateShort(date: Date | string): string {
  return DATE_SHORT.format(new Date(date));
}

/** "22 abr 2026" */
export function formatDateMedium(date: Date | string): string {
  return DATE_MEDIUM.format(new Date(date));
}

/** "miércoles, 22 de abril de 2026" — pass a BCP-47 locale to override */
export function formatDateLong(date: Date | string, locale: string = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

/** "14:32" */
export function formatTime(date: Date | string): string {
  return TIME.format(new Date(date));
}

/** "22 abr 2026 · 14:32" */
export function formatDateTime(date: Date | string): string {
  return `${formatDateMedium(date)} · ${formatTime(date)}`;
}

/** Relative time: "hace 3 min", "hace 2 días", "hace 1 hora" */
export function formatRelative(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  if (days < 30) return `hace ${days} ${days === 1 ? "día" : "días"}`;
  return formatDateMedium(date);
}

// ── Greeting ──────────────────────────────────────────────────────────────────

/** "Buenos días" / "Good morning" — locale: "es" or "en" */
export function getGreeting(locale: string = "es"): string {
  const hour = new Date().getHours();
  if (locale === "en") {
    if (hour >= 6 && hour < 14) return "Good morning";
    if (hour >= 14 && hour < 21) return "Good afternoon";
    return "Good evening";
  }
  if (hour >= 6 && hour < 14) return "Buenos días";
  if (hour >= 14 && hour < 21) return "Buenas tardes";
  return "Buenas noches";
}

"use client";

interface Entry {
  value: number;
  name: string;
  payload: Record<string, unknown>;
}

interface Props {
  active?: boolean;
  payload?: Entry[];
  label?: string;
  formatValue?: (v: number) => string;
  formatLabel?: (l: string) => string;
  getColor?: (v: number) => string;
}

export default function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  formatLabel,
  getColor,
}: Props) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const displayLabel = label ? (formatLabel ? formatLabel(label) : label) : null;
  const colorFn = getColor ?? ((v: number) => (v >= 0 ? "#2fac66" : "#f06060"));

  return (
    <div
      style={{
        background: "#272727",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "4px",
        padding: "10px 14px",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "12px",
        color: "#e8ebe8",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        pointerEvents: "none",
      }}
    >
      {displayLabel && (
        <p style={{ color: "#9ca3af", marginBottom: 6, fontSize: 11 }}>
          {displayLabel}
        </p>
      )}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: colorFn(entry.value), margin: "2px 0" }}>
          {formatValue ? formatValue(entry.value) : String(entry.value)}
        </p>
      ))}
      {typeof data.count === "number" && (data.count as number) > 0 && (
        <p style={{ color: "#9ca3af", marginTop: 4, fontSize: 10 }}>
          {data.count as number} ops
        </p>
      )}
    </div>
  );
}

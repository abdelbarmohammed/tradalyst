// Static dashboard preview — used in Hero. No interactivity needed.
const HEATMAP: number[][] = [
  [0, 2, 0, 1, -1, 0, 0],
  [0, 0, 3, 0, 2, 0, 1],
  [1, 0, 0, 2, 0, -1, 0],
  [-1, 0, 1, 0, 3, 0, 2],
  [0, 3, 2, 0, 1, 0, 0],
  [0, 0, 0, 2, 3, 0, 1],
  [2, 0, 1, -1, 0, 2, 0],
  [0, 2, 3, 0, 2, 0, 1],
  [1, 0, 0, 2, 0, 3, 0],
  [0, 0, 2, 0, -1, 0, 2],
  [2, 1, 0, 0, 3, 0, 1],
  [0, 3, 2, 0, 1, 2, 0],
];

function heatColor(v: number): string {
  if (v === 0) return "#303030";
  if (v === 1) return "rgba(47,172,102,0.30)";
  if (v === 2) return "rgba(47,172,102,0.60)";
  if (v === 3) return "#2fac66";
  if (v === -1) return "rgba(217,64,64,0.40)";
  return "#d94040";
}

const STAT_CARDS = [
  { label: "P&L Total", value: "+€2.847", color: "#2fac66" },
  { label: "Win Rate", value: "68%", color: "#e8ebe8" },
  { label: "Operaciones", value: "47", color: "#e8ebe8" },
  { label: "R:R Medio", value: "1.8", color: "#e8ebe8" },
];

const NAV_ICONS = ["▪", "▪", "▪", "▪", "▪"];

export default function DashboardMockup() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderRadius: "6px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.20)",
        background: "#1e1e1e",
        maxWidth: 620,
      }}
    >
      {/* Window bar */}
      <div
        style={{
          background: "#151515",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-mono), monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            marginLeft: "auto",
            letterSpacing: "0.05em",
          }}
        >
          app.tradalyst.com/dashboard
        </span>
      </div>

      {/* App shell */}
      <div style={{ display: "flex", height: 340 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 44,
            background: "#151515",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 14,
            gap: 18,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "#2fac66",
              borderRadius: "3px",
              marginBottom: 6,
            }}
          />
          {NAV_ICONS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 20,
                height: 3,
                borderRadius: "2px",
                background: i === 0 ? "rgba(47,172,102,0.8)" : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, padding: "12px 14px", overflowY: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-ibm-plex-sans), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#e8ebe8",
              }}
            >
              Buenos días, Alex
            </span>
            <span
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.30)",
              }}
            >
              21 ABR 2026
            </span>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                style={{
                  background: "#272727",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "7px 8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 7,
                    color: "rgba(255,255,255,0.30)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: card.color,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* P&L chart + AI insight */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {/* P&L chart */}
            <div
              style={{
                flex: "3",
                background: "#272727",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 10px 6px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  fontSize: 7,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Curva P&L · Últimos 90 días
              </div>
              <svg viewBox="0 0 280 70" width="100%" height="70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pnl-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2fac66" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2fac66" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Fill area */}
                <path
                  d="M 0,58 C 15,55 22,62 35,54 C 48,46 55,60 68,52 C 81,44 90,48 105,38 C 118,29 126,44 140,36 C 154,28 160,32 175,22 C 188,14 196,18 210,12 C 222,7 232,9 245,5 C 255,2 270,3 280,1 L 280,70 L 0,70 Z"
                  fill="url(#pnl-fill)"
                />
                {/* Line */}
                <path
                  d="M 0,58 C 15,55 22,62 35,54 C 48,46 55,60 68,52 C 81,44 90,48 105,38 C 118,29 126,44 140,36 C 154,28 160,32 175,22 C 188,14 196,18 210,12 C 222,7 232,9 245,5 C 255,2 270,3 280,1"
                  fill="none"
                  stroke="#2fac66"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* AI insight card */}
            <div
              style={{
                flex: "1.4",
                background: "#272727",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#2fac66",
                    flexShrink: 0,
                    boxShadow: "0 0 0 2px rgba(47,172,102,0.25)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: 7,
                    color: "#2fac66",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  IA · Insight
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-ibm-plex-sans), sans-serif",
                  fontSize: 8.5,
                  color: "rgba(232,235,232,0.75)",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                Tu rendimiento es <strong style={{ color: "#2fac66" }}>38% mejor</strong> los martes. Las operaciones marcadas como FOMO tienen un 19% win rate.
              </p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {["FOMO ↑", "Martes ★", "R:R ↗"].map((tag, i) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: 6.5,
                      padding: "2px 5px",
                      borderRadius: "2px",
                      background: i === 0 ? "rgba(217,64,64,0.15)" : "rgba(47,172,102,0.15)",
                      color: i === 0 ? "#f06060" : "#2fac66",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Activity heatmap */}
          <div
            style={{
              background: "#272727",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "7px 10px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: 7,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Actividad · 12 semanas
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {HEATMAP.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {week.map((v, di) => (
                    <div
                      key={di}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "1px",
                        background: heatColor(v),
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

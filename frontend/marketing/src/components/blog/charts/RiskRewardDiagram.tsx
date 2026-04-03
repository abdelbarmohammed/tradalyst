interface Props {
  lang?: string;
}

const SVG_W = 600;
const SVG_H = 220;
const LINE_X1 = 90;
const LINE_X2 = 460;

// Entry at y=130, TP at y=50 (2R = 80px above), SL at y=170 (1R = 40px below)
const ENTRY_Y = 130;
const TP_Y = 50;
const SL_Y = 170;

export default function RiskRewardDiagram({ lang = "es" }: Props) {
  const labels = {
    title:
      lang === "en"
        ? "Risk-reward ratio 1:2 — visual breakdown"
        : "Ratio riesgo-beneficio 1:2 — desglose visual",
    tp: "TP  +2R",
    sl: "SL  −1R",
    entry: lang === "en" ? "Entry" : "Entrada",
    profitZone: lang === "en" ? "Profit zone" : "Zona de beneficio",
    lossZone: lang === "en" ? "Loss zone" : "Zona de pérdida",
    caption:
      lang === "en"
        ? "1:2 trade: risking 1R to gain 2R. Breakeven at 33% win rate."
        : "Operación 1:2: arriesgas 1R para ganar 2R. Punto de equilibrio: 33% win rate.",
  };

  const midX = (LINE_X1 + LINE_X2) / 2;

  return (
    <figure className="my-8">
      <div style={{ backgroundColor: "#f5f6f2", padding: "16px 16px 12px" }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#8a8f8c",
            marginBottom: "10px",
          }}
        >
          {labels.title}
        </p>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", width: "100%", height: "auto" }}
          aria-hidden="true"
        >
          {/* Profit zone fill */}
          <rect
            x={LINE_X1}
            y={TP_Y}
            width={LINE_X2 - LINE_X1}
            height={ENTRY_Y - TP_Y}
            fill="#2fac66"
            fillOpacity="0.09"
          />

          {/* Loss zone fill */}
          <rect
            x={LINE_X1}
            y={ENTRY_Y}
            width={LINE_X2 - LINE_X1}
            height={SL_Y - ENTRY_Y}
            fill="#d94040"
            fillOpacity="0.09"
          />

          {/* TP line */}
          <line x1={LINE_X1} y1={TP_Y} x2={LINE_X2} y2={TP_Y} stroke="#2fac66" strokeWidth="2" />
          <text
            x={LINE_X2 + 10}
            y={TP_Y + 5}
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12"
            fontWeight="600"
            fill="#2fac66"
          >
            {labels.tp}
          </text>

          {/* Entry line (dashed) */}
          <line
            x1={LINE_X1}
            y1={ENTRY_Y}
            x2={LINE_X2}
            y2={ENTRY_Y}
            stroke="#0f1110"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text
            x={LINE_X2 + 10}
            y={ENTRY_Y + 5}
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12"
            fill="#5a5f5c"
          >
            {labels.entry}
          </text>

          {/* SL line */}
          <line x1={LINE_X1} y1={SL_Y} x2={LINE_X2} y2={SL_Y} stroke="#d94040" strokeWidth="2" />
          <text
            x={LINE_X2 + 10}
            y={SL_Y + 5}
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12"
            fontWeight="600"
            fill="#d94040"
          >
            {labels.sl}
          </text>

          {/* Zone labels */}
          <text
            x={midX}
            y={(TP_Y + ENTRY_Y) / 2 + 5}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="10"
            fill="#2fac66"
          >
            {labels.profitZone}
          </text>
          <text
            x={midX}
            y={(ENTRY_Y + SL_Y) / 2 + 5}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="10"
            fill="#d94040"
          >
            {labels.lossZone}
          </text>

          {/* R markers — vertical brackets on the left */}
          {/* 1R bracket */}
          <line x1={LINE_X1 - 14} y1={ENTRY_Y} x2={LINE_X1 - 14} y2={SL_Y} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <line x1={LINE_X1 - 18} y1={ENTRY_Y} x2={LINE_X1 - 10} y2={ENTRY_Y} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <line x1={LINE_X1 - 18} y1={SL_Y} x2={LINE_X1 - 10} y2={SL_Y} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <text
            x={LINE_X1 - 22}
            y={(ENTRY_Y + SL_Y) / 2 + 4}
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="9"
            fill="rgba(0,0,0,0.35)"
          >
            1R
          </text>

          {/* 2R bracket */}
          <line x1={LINE_X1 - 14} y1={TP_Y} x2={LINE_X1 - 14} y2={ENTRY_Y} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <line x1={LINE_X1 - 18} y1={TP_Y} x2={LINE_X1 - 10} y2={TP_Y} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
          <text
            x={LINE_X1 - 22}
            y={(TP_Y + ENTRY_Y) / 2 + 4}
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="9"
            fill="rgba(0,0,0,0.35)"
          >
            2R
          </text>
        </svg>
      </div>
      <figcaption
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          color: "#8a8f8c",
          textAlign: "center",
          marginTop: "6px",
        }}
      >
        {labels.caption}
      </figcaption>
    </figure>
  );
}

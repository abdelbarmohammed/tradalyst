interface Props {
  lang?: string;
}

interface Bar {
  es: string;
  en: string;
  value: number;
}

const BARS: Bar[] = [
  { es: "Confiado", en: "Confident", value: 83 },
  { es: "Incierto", en: "Uncertain", value: 52 },
  { es: "FOMO", en: "FOMO", value: 31 },
  { es: "Revenge", en: "Revenge", value: 25 },
];

const ROW_H = 44;
const LABEL_W = 110;
const BAR_X = 120;
const BAR_MAX_W = 380;
const SVG_W = 600;
const SVG_H = BARS.length * ROW_H + 28;

export default function EmotionWinRateChart({ lang = "es" }: Props) {
  const title = lang === "en" ? "Win rate by emotional state at entry" : "Win rate por estado emocional al entrar";
  const caption =
    lang === "en"
      ? "Based on anonymised Tradalyst account data."
      : "Basado en datos anónimos de cuentas de Tradalyst.";

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
            marginBottom: "12px",
          }}
        >
          {title}
        </p>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", width: "100%", height: "auto" }}
          aria-hidden="true"
        >
          {BARS.map((bar, i) => {
            const y = i * ROW_H + 4;
            const barW = (bar.value / 100) * BAR_MAX_W;
            const color = bar.value >= 50 ? "#2fac66" : "#d94040";
            const label = lang === "en" ? bar.en : bar.es;

            return (
              <g key={i}>
                {/* Label */}
                <text
                  x={LABEL_W}
                  y={y + 16}
                  textAnchor="end"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="12"
                  fill="#0f1110"
                >
                  {label}
                </text>

                {/* Track */}
                <rect
                  x={BAR_X}
                  y={y + 2}
                  width={BAR_MAX_W}
                  height={20}
                  fill="rgba(0,0,0,0.06)"
                />

                {/* Bar */}
                <rect x={BAR_X} y={y + 2} width={barW} height={20} fill={color} />

                {/* Percentage */}
                <text
                  x={BAR_X + barW + 8}
                  y={y + 16}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="12"
                  fontWeight="600"
                  fill={color}
                >
                  {bar.value}%
                </text>
              </g>
            );
          })}

          {/* 50% threshold marker */}
          <line
            x1={BAR_X + BAR_MAX_W * 0.5}
            y1={0}
            x2={BAR_X + BAR_MAX_W * 0.5}
            y2={SVG_H - 16}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={BAR_X + BAR_MAX_W * 0.5}
            y={SVG_H - 2}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="9"
            fill="rgba(0,0,0,0.3)"
          >
            50%
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
        {caption}
      </figcaption>
    </figure>
  );
}

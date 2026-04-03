interface Props {
  variant?: "positive" | "revenge";
  lang?: string;
}

const POSITIVE_DATA = [0, 80, 60, 140, 110, 180, 220, 190, 260, 240, 300, 340];
const REVENGE_DATA = [0, 60, 100, 80, 120, 90, 60, 20, -60, -30, -100, -150];
const WEEK_LABELS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12"];

const PAD_L = 44;
const PAD_R = 20;
const PAD_T = 18;
const PAD_B = 36;
const W = 600;
const H = 220;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

function pts(data: number[]) {
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  return data.map((v, i) => ({
    x: PAD_L + (i / (data.length - 1)) * PLOT_W,
    y: PAD_T + PLOT_H - ((v - minV) / range) * PLOT_H,
  }));
}

function linePath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

function areaPath(points: { x: number; y: number }[], baseY: number) {
  const last = points[points.length - 1];
  const first = points[0];
  return `${linePath(points)} L ${last.x.toFixed(1)} ${baseY} L ${first.x.toFixed(1)} ${baseY} Z`;
}

export default function PnlCurveChart({ variant = "positive", lang = "es" }: Props) {
  const data = variant === "positive" ? POSITIVE_DATA : REVENGE_DATA;
  const color = variant === "positive" ? "#2fac66" : "#d94040";

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV;

  const zeroY = PAD_T + PLOT_H - ((0 - minV) / range) * PLOT_H;
  const points = pts(data);
  const gridYs = [0.25, 0.5, 0.75].map((f) => PAD_T + f * PLOT_H);

  const title =
    lang === "en"
      ? variant === "positive"
        ? "Consistent execution — cumulative P&L"
        : "Revenge trading cycle — cumulative P&L"
      : variant === "positive"
      ? "Ejecución consistente — P&L acumulado"
      : "Ciclo de revenge trading — P&L acumulado";

  const caption =
    lang === "en"
      ? "Illustrative. Based on anonymised Tradalyst account data."
      : "Ilustrativo. Basado en datos anónimos de cuentas de Tradalyst.";

  return (
    <figure className="my-8">
      <div style={{ backgroundColor: "#f5f6f2", padding: "16px 16px 8px" }}>
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
          {title}
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", width: "100%", height: "auto" }} aria-hidden="true">
          {/* Horizontal grid lines */}
          {gridYs.map((y, i) => (
            <line
              key={i}
              x1={PAD_L}
              y1={y}
              x2={W - PAD_R}
              y2={y}
              stroke="rgba(0,0,0,0.07)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Zero line for revenge variant */}
          {variant === "revenge" && (
            <line
              x1={PAD_L}
              y1={zeroY}
              x2={W - PAD_R}
              y2={zeroY}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="1"
              strokeDasharray="6 3"
            />
          )}

          {/* Area fill */}
          <path
            d={areaPath(points, variant === "revenge" ? zeroY : PAD_T + PLOT_H)}
            fill={color}
            fillOpacity="0.08"
          />

          {/* Line */}
          <path
            d={linePath(points)}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* X-axis labels */}
          {WEEK_LABELS.map((label, i) => {
            const x = PAD_L + (i / (WEEK_LABELS.length - 1)) * PLOT_W;
            return (
              <text
                key={i}
                x={x}
                y={H - 6}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="9"
                fill="rgba(0,0,0,0.35)"
              >
                {label}
              </text>
            );
          })}

          {/* Y-axis +/- labels */}
          <text
            x={PAD_L - 6}
            y={PAD_T + 8}
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11"
            fill="rgba(0,0,0,0.35)"
          >
            +
          </text>
          <text
            x={PAD_L - 6}
            y={PAD_T + PLOT_H + 4}
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11"
            fill="rgba(0,0,0,0.35)"
          >
            {variant === "revenge" ? "−" : "0"}
          </text>

          {/* Zero label for revenge */}
          {variant === "revenge" && (
            <text
              x={PAD_L - 6}
              y={zeroY + 4}
              textAnchor="end"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="9"
              fill="rgba(0,0,0,0.3)"
            >
              0
            </text>
          )}
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

import type { PnlPoint } from "@/types";

interface Props {
  data: PnlPoint[];
  loading?: boolean;
}

const W = 600;
const H = 140;
const PAD = { top: 12, right: 8, bottom: 20, left: 52 };

function toPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

export default function PnlChart({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-24 mb-4 rounded-sm" />
        <div className="skeleton w-full rounded-sm" style={{ height: H }} />
      </div>
    );
  }

  // Filter points that have valid cumPnl
  const pts = data.filter((d) => Number.isFinite(d.cumPnl));

  if (pts.length < 2) {
    return (
      <div className="card p-5 flex items-center justify-center" style={{ minHeight: H + 40 }}>
        <p className="font-mono text-[11px] text-muted">
          Sin suficientes datos para la curva P&L.
        </p>
      </div>
    );
  }

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minY = Math.min(...pts.map((p) => p.cumPnl));
  const maxY = Math.max(...pts.map((p) => p.cumPnl));
  const rangeY = maxY - minY || 1;

  const svgPoints = pts.map((p, i) => ({
    x: PAD.left + (i / (pts.length - 1)) * chartW,
    y: PAD.top + (1 - (p.cumPnl - minY) / rangeY) * chartH,
  }));

  const linePath = toPath(svgPoints);
  const firstPt = svgPoints[0];
  const lastPt = svgPoints[svgPoints.length - 1];
  const fillPath =
    linePath +
    ` L ${lastPt.x.toFixed(1)},${(PAD.top + chartH).toFixed(1)}` +
    ` L ${firstPt.x.toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  // Y axis labels (3 levels)
  const yLabels = [maxY, (maxY + minY) / 2, minY].map((v, i) => ({
    value: v,
    y: PAD.top + (i / 2) * chartH,
  }));

  // X axis labels — show first and last date
  const xLabels = [
    { label: pts[0].date.slice(5), x: PAD.left },
    { label: pts[pts.length - 1].date.slice(5), x: W - PAD.right },
  ];

  const isPositive = (pts[pts.length - 1]?.cumPnl ?? 0) >= 0;
  const lineColor = isPositive ? "#2fac66" : "#f06060";
  const fillId = "pnl-fill";

  return (
    <div className="card p-5">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted mb-3">
        Curva P&L
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Zero line */}
        {minY < 0 && maxY > 0 && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + (1 - (0 - minY) / rangeY) * chartH}
            y2={PAD.top + (1 - (0 - minY) / rangeY) * chartH}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {/* Fill area */}
        <path d={fillPath} fill={`url(#${fillId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Y axis labels */}
        {yLabels.map(({ value, y }) => (
          <text
            key={value}
            x={PAD.left - 4}
            y={y + 3}
            textAnchor="end"
            fontSize="8"
            fontFamily="var(--font-ibm-plex-mono)"
            fill="rgba(156,163,175,0.8)"
          >
            {value >= 0 ? "+" : ""}
            {value.toFixed(0)}€
          </text>
        ))}

        {/* X axis labels */}
        {xLabels.map(({ label, x }) => (
          <text
            key={label}
            x={x}
            y={H - 4}
            textAnchor={x === PAD.left ? "start" : "end"}
            fontSize="8"
            fontFamily="var(--font-ibm-plex-mono)"
            fill="rgba(156,163,175,0.8)"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

interface Props {
  lang?: string;
}

interface Row {
  metricEs: string;
  metricEn: string;
  formulaEs: string;
  formulaEn: string;
  goodEs: string;
  goodEn: string;
}

const ROWS: Row[] = [
  {
    metricEs: "Win Rate",
    metricEn: "Win Rate",
    formulaEs: "Ganadoras / Total",
    formulaEn: "Winners / Total trades",
    goodEs: "Varía con R:R",
    goodEn: "Depends on R:R",
  },
  {
    metricEs: "Ratio R:R",
    metricEn: "Risk-Reward",
    formulaEs: "Distancia TP / Distancia SL",
    formulaEn: "TP distance / SL distance",
    goodEs: "> 1:1.5",
    goodEn: "> 1:1.5",
  },
  {
    metricEs: "Profit Factor",
    metricEn: "Profit Factor",
    formulaEs: "Σ Ganancias / Σ Pérdidas",
    formulaEn: "Σ Gains / Σ Losses",
    goodEs: "> 1.5",
    goodEn: "> 1.5",
  },
  {
    metricEs: "Expectancy",
    metricEn: "Expectancy",
    formulaEs: "(WR × G_med) − (LR × P_med)",
    formulaEn: "(WR × Avg_win) − (LR × Avg_loss)",
    goodEs: "> 0",
    goodEn: "> 0",
  },
  {
    metricEs: "Drawdown Máx.",
    metricEn: "Max Drawdown",
    formulaEs: "(Pico − Valle) / Pico",
    formulaEn: "(Peak − Trough) / Peak",
    goodEs: "< 20%",
    goodEn: "< 20%",
  },
];

export default function MetricsTable({ lang = "es" }: Props) {
  const headers =
    lang === "en" ? ["Metric", "Formula", "Good value"] : ["Métrica", "Fórmula", "Buen valor"];
  const caption =
    lang === "en"
      ? "The 5 core trading metrics — Tradalyst"
      : "Las 5 métricas fundamentales del trading — Tradalyst";

  return (
    <figure className="my-8">
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "rgba(47, 172, 102, 0.08)",
                borderBottom: "2px solid #2fac66",
              }}
            >
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "10px 14px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#0f1110",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#f5f6f2" : "#ffffff",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <td
                  style={{
                    padding: "9px 14px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0f1110",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lang === "en" ? row.metricEn : row.metricEs}
                </td>
                <td
                  style={{
                    padding: "9px 14px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    color: "#5a5f5c",
                  }}
                >
                  {lang === "en" ? row.formulaEn : row.formulaEs}
                </td>
                <td
                  style={{
                    padding: "9px 14px",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#0f1110",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lang === "en" ? row.goodEn : row.goodEs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          color: "#8a8f8c",
          textAlign: "center",
          marginTop: "8px",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

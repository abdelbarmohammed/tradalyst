import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, BrainCircuit, Eye, BarChart2 } from "lucide-react";
import { APP_URL } from "@/lib/urls";

export const metadata: Metadata = {
  title: "Funcionalidades — Tradalyst",
  description:
    "Diario de operaciones, análisis de IA conductual, vista mentor y dashboard de rendimiento. Todo lo que necesitas para operar mejor.",
};

/* ─── SVG illustrations ─────────────────────────────────────────────────── */

function TradeFormIllustration() {
  return (
    <svg
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      {/* Card */}
      <rect width="360" height="220" fill="#f5f6f2" />
      {/* Top bar */}
      <rect width="360" height="38" fill="#eceee8" />
      <circle cx="16" cy="19" r="5" fill="#e0e0d8" />
      <circle cx="32" cy="19" r="5" fill="#e0e0d8" />
      <circle cx="48" cy="19" r="5" fill="#e0e0d8" />
      <text x="72" y="24" fontFamily="monospace" fontSize="11" fill="#9ca3af">
        Nueva operación
      </text>

      {/* Row 1: Activo / Dirección / P&L */}
      <rect x="12" y="50" width="110" height="38" fill="white" stroke="#e0e0d8" strokeWidth="1" />
      <text x="20" y="63" fontFamily="monospace" fontSize="8" fill="#9ca3af">ACTIVO</text>
      <text x="20" y="80" fontFamily="monospace" fontSize="13" fill="#0f1110" fontWeight="600">BTC/USDT</text>

      <rect x="130" y="50" width="76" height="38" fill="#2fac66" />
      <text x="168" y="74" fontFamily="monospace" fontSize="12" fill="white" textAnchor="middle" fontWeight="600">LONG</text>

      <rect x="214" y="50" width="134" height="38" fill="white" stroke="#2fac66" strokeWidth="1" />
      <text x="224" y="63" fontFamily="monospace" fontSize="8" fill="#9ca3af">P&amp;L</text>
      <text x="281" y="80" fontFamily="monospace" fontSize="14" fill="#2fac66" textAnchor="middle" fontWeight="700">+2.4%</text>

      {/* Razonamiento */}
      <text x="12" y="108" fontFamily="monospace" fontSize="8" fill="#9ca3af" letterSpacing="1">RAZONAMIENTO</text>
      <rect x="12" y="114" width="336" height="48" fill="white" stroke="#e0e0d8" strokeWidth="1" />
      <text x="20" y="132" fontFamily="monospace" fontSize="10" fill="#4b5563">Rompió resistencia con volumen alto.</text>
      <text x="20" y="148" fontFamily="monospace" fontSize="10" fill="#4b5563">Confluencia con soporte semanal.</text>

      {/* Estado emocional */}
      <text x="12" y="178" fontFamily="monospace" fontSize="8" fill="#9ca3af" letterSpacing="1">ESTADO EMOCIONAL</text>
      <rect x="12" y="184" width="72" height="24" fill="#edf7f2" stroke="#2fac66" strokeWidth="1" />
      <text x="48" y="200" fontFamily="monospace" fontSize="10" fill="#2fac66" textAnchor="middle">Confiado</text>
      <rect x="92" y="184" width="60" height="24" fill="#f5f6f2" stroke="#e0e0d8" strokeWidth="1" />
      <text x="122" y="200" fontFamily="monospace" fontSize="10" fill="#9ca3af" textAnchor="middle">FOMO</text>
      <rect x="160" y="184" width="68" height="24" fill="#f5f6f2" stroke="#e0e0d8" strokeWidth="1" />
      <text x="194" y="200" fontFamily="monospace" fontSize="10" fill="#9ca3af" textAnchor="middle">Nervioso</text>
    </svg>
  );
}

function AiInsightIllustration() {
  return (
    <svg
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <rect width="360" height="220" fill="#f5f6f2" />
      {/* Header */}
      <rect width="360" height="38" fill="#eceee8" />
      <text x="12" y="24" fontFamily="monospace" fontSize="11" fill="#9ca3af">Análisis semanal · IA</text>
      <rect x="284" y="11" width="64" height="18" fill="#2fac66" />
      <text x="316" y="23" fontFamily="monospace" fontSize="9" fill="white" textAnchor="middle">Claude AI</text>

      {/* Insight body */}
      <rect x="12" y="50" width="336" height="88" fill="white" stroke="#e0e0d8" strokeWidth="1" />
      <text x="22" y="70" fontFamily="monospace" fontSize="10" fill="#0f1110">En los últimos 30 días abriste 14</text>
      <text x="22" y="85" fontFamily="monospace" fontSize="10" fill="#0f1110">operaciones en FOMO. 11 terminaron</text>
      <text x="22" y="100" fontFamily="monospace" fontSize="10" fill="#0f1110">en pérdida. Tu mejor rendimiento</text>
      <text x="22" y="115" fontFamily="monospace" fontSize="10" fill="#0f1110">ocurre los martes entre las 10h–13h.</text>
      <text x="22" y="128" fontFamily="monospace" fontSize="10" fill="#9ca3af">Tu tasa de error sube un 38% después de las 15h.</text>

      {/* Tags */}
      <rect x="12" y="150" width="104" height="22" fill="#fef2f2" stroke="#d94040" strokeWidth="1" />
      <text x="64" y="165" fontFamily="monospace" fontSize="9" fill="#d94040" textAnchor="middle">FOMO Trading ↑</text>

      <rect x="124" y="150" width="120" height="22" fill="#edf7f2" stroke="#2fac66" strokeWidth="1" />
      <text x="184" y="165" fontFamily="monospace" fontSize="9" fill="#2fac66" textAnchor="middle">Martes 10h–13h ★</text>

      <rect x="252" y="150" width="96" height="22" fill="#f5f6f2" stroke="#e0e0d8" strokeWidth="1" />
      <text x="300" y="165" fontFamily="monospace" fontSize="9" fill="#4b5563" textAnchor="middle">R:R Mejorando</text>

      {/* Mini bar chart */}
      <text x="12" y="194" fontFamily="monospace" fontSize="8" fill="#9ca3af">FOMO vs. Normal · resultados</text>
      {/* bars */}
      <rect x="12" y="198" width="18" height="16" fill="#d94040" opacity="0.7" />
      <rect x="34" y="204" width="18" height="10" fill="#d94040" opacity="0.4" />
      <rect x="56" y="202" width="18" height="12" fill="#d94040" opacity="0.6" />
      <rect x="100" y="196" width="18" height="18" fill="#2fac66" opacity="0.8" />
      <rect x="122" y="200" width="18" height="14" fill="#2fac66" opacity="0.6" />
      <rect x="144" y="197" width="18" height="17" fill="#2fac66" opacity="0.7" />
      <text x="21" y="216" fontFamily="monospace" fontSize="7" fill="#9ca3af" textAnchor="middle">F</text>
      <text x="109" y="216" fontFamily="monospace" fontSize="7" fill="#9ca3af" textAnchor="middle">N</text>
    </svg>
  );
}

function MentorIllustration() {
  return (
    <svg
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <rect width="360" height="220" fill="#f5f6f2" />

      {/* Left panel — trader journal */}
      <rect x="0" y="0" width="178" height="220" fill="#eceee8" />
      <text x="12" y="22" fontFamily="monospace" fontSize="9" fill="#9ca3af" letterSpacing="1">DIARIO · ALEX G.</text>

      {/* Trade rows */}
      {[
        { y: 34, asset: "BTC/USDT", dir: "L", pnl: "+1.8%", color: "#2fac66" },
        { y: 66, asset: "ETH/USDT", dir: "S", pnl: "-0.9%", color: "#d94040" },
        { y: 98, asset: "EUR/USD", dir: "L", pnl: "+0.4%", color: "#2fac66" },
        { y: 130, asset: "BTC/USDT", dir: "L", pnl: "-2.1%", color: "#d94040" },
      ].map((row) => (
        <g key={row.y}>
          <rect x="8" y={row.y} width="162" height="26" fill="white" stroke="#e0e0d8" strokeWidth="0.5" />
          <rect x="8" y={row.y} width="3" height="26" fill={row.color} />
          <text x="18" y={row.y + 11} fontFamily="monospace" fontSize="9" fill="#0f1110">{row.asset}</text>
          <text x="18" y={row.y + 22} fontFamily="monospace" fontSize="8" fill="#9ca3af">{row.dir === "L" ? "LONG" : "SHORT"}</text>
          <text x="155" y={row.y + 17} fontFamily="monospace" fontSize="10" fill={row.color} textAnchor="end" fontWeight="600">{row.pnl}</text>
        </g>
      ))}

      {/* Read-only badge */}
      <rect x="8" y="165" width="82" height="18" fill="#f5f6f2" stroke="#e0e0d8" strokeWidth="1" />
      <text x="49" y="177" fontFamily="monospace" fontSize="8" fill="#9ca3af" textAnchor="middle">Solo lectura</text>

      {/* Right panel — annotation */}
      <rect x="182" y="0" width="178" height="220" fill="white" />
      <text x="192" y="22" fontFamily="monospace" fontSize="9" fill="#9ca3af" letterSpacing="1">ANOTACIÓN MENTOR</text>
      <rect x="192" y="30" width="158" height="3" fill="#2fac66" />

      <text x="192" y="54" fontFamily="monospace" fontSize="9" fill="#0f1110">Operación #3 — EUR/USD</text>
      <rect x="192" y="62" width="158" height="64" fill="#f5f6f2" stroke="#e0e0d8" strokeWidth="1" />
      <text x="200" y="78" fontFamily="monospace" fontSize="9" fill="#4b5563">Entrada precipitada. El setup</text>
      <text x="200" y="92" fontFamily="monospace" fontSize="9" fill="#4b5563">era válido pero el R:R no</text>
      <text x="200" y="106" fontFamily="monospace" fontSize="9" fill="#4b5563">justificaba el riesgo tomado.</text>
      <text x="200" y="120" fontFamily="monospace" fontSize="9" fill="#4b5563">Revisa el plan antes de entrar.</text>

      <text x="192" y="146" fontFamily="monospace" fontSize="8" fill="#9ca3af">ETIQUETA</text>
      <rect x="192" y="152" width="80" height="18" fill="#fef2f2" stroke="#d94040" strokeWidth="1" />
      <text x="232" y="164" fontFamily="monospace" fontSize="8" fill="#d94040" textAnchor="middle">Gestión riesgo</text>

      <text x="192" y="194" fontFamily="monospace" fontSize="8" fill="#9ca3af">— Carlos M., mentor</text>
    </svg>
  );
}

function DashboardIllustration() {
  const points = [
    [0, 52], [32, 44], [64, 58], [96, 36], [128, 28], [160, 40],
    [192, 20], [224, 14], [256, 22], [288, 8],
  ] as [number, number][];
  const polyline = points.map((p) => p.join(",")).join(" ");
  const area = `${points[0][0]},72 ${polyline} ${points[points.length - 1][0]},72`;

  return (
    <svg
      viewBox="0 0 360 220"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <rect width="360" height="220" fill="#f5f6f2" />

      {/* Stat cards */}
      {[
        { x: 8,   label: "P&L neto",     value: "+€ 1.840", color: "#2fac66" },
        { x: 128, label: "Win rate",      value: "61 %",     color: "#0f1110" },
        { x: 248, label: "Operaciones",   value: "47",       color: "#0f1110" },
      ].map((card) => (
        <g key={card.x}>
          <rect x={card.x} y="8" width="112" height="52" fill="white" stroke="#e0e0d8" strokeWidth="1" />
          <text x={card.x + 10} y="24" fontFamily="monospace" fontSize="8" fill="#9ca3af">{card.label}</text>
          <text x={card.x + 10} y="46" fontFamily="monospace" fontSize="16" fill={card.color} fontWeight="700">{card.value}</text>
        </g>
      ))}

      {/* P&L chart */}
      <rect x="8" y="72" width="344" height="100" fill="white" stroke="#e0e0d8" strokeWidth="1" />
      <text x="18" y="88" fontFamily="monospace" fontSize="8" fill="#9ca3af">CURVA P&amp;L · 30 días</text>

      {/* Grid lines */}
      {[100, 118, 136].map((y) => (
        <line key={y} x1="28" y1={y} x2="344" y2={y} stroke="#f0f0ec" strokeWidth="1" />
      ))}

      {/* Area fill */}
      <polygon
        points={area}
        fill="#2fac66"
        opacity="0.08"
        transform="translate(28, 88)"
      />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#2fac66"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        transform="translate(28, 88)"
      />
      {/* Last point dot */}
      <circle cx={316 + 28} cy={8 + 88} r="3" fill="#2fac66" />

      {/* Activity heatmap */}
      <text x="18" y="186" fontFamily="monospace" fontSize="8" fill="#9ca3af">ACTIVIDAD</text>
      {Array.from({ length: 24 }).map((_, i) => {
        const intensity = [0, 0, 0, 1, 2, 3, 2, 1, 0, 2, 3, 2, 1, 0, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0][i];
        const fills = ["#f0f0ec", "#c8e8d8", "#8fd4b0", "#2fac66"];
        return (
          <rect
            key={i}
            x={28 + i * 13}
            y={192}
            width="11"
            height="11"
            fill={fills[intensity]}
          />
        );
      })}
    </svg>
  );
}

/* ─── Feature row ────────────────────────────────────────────────────────── */

interface FeatureRowProps {
  icon: React.ReactNode;
  badge: string;
  title: string;
  body: string;
  illustration: React.ReactNode;
  reverse?: boolean;
}

function FeatureRow({ icon, badge, title, body, illustration, reverse }: FeatureRowProps) {
  return (
    <section className="border-b border-black/[0.08]">
      <div className="max-w-[1080px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          {/* Text side */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="text-green">{icon}</div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted border border-black/[0.10] px-2 py-[3px]">
                {badge}
              </span>
            </div>
            <h2 className="font-sans text-[26px] lg:text-[30px] font-bold text-text tracking-[-0.015em] leading-[1.1] mb-4">
              {title}
            </h2>
            <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
              {body}
            </p>
          </div>

          {/* Visual side */}
          <div className="border border-black/[0.08] overflow-hidden bg-surface">
            {illustration}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Funcionalidades() {
  return (
    <div className="bg-light min-h-screen">
      {/* Hero */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">Funcionalidades</p>
          <h1 className="font-sans text-[36px] lg:text-[48px] font-bold text-text leading-[1.05] tracking-[-0.02em] mb-5">
            Todo lo que necesitas para operar mejor.
          </h1>
          <p className="font-sans text-[16px] text-text-secondary leading-relaxed max-w-[520px]">
            Un diario completo, análisis de IA conductual, acceso mentor y un dashboard de rendimiento — en una sola herramienta.
          </p>
        </div>
      </section>

      {/* Row 1 — Diario */}
      <FeatureRow
        icon={<BookOpen size={22} />}
        badge="Diario completo"
        title="Registra lo que los números no cuentan."
        body="Registra cada operación con tu razonamiento y estado emocional. Crypto, forex y acciones en un solo lugar. Busca, filtra y exporta tu historial completo cuando quieras."
        illustration={<TradeFormIllustration />}
      />

      {/* Row 2 — IA */}
      <FeatureRow
        reverse
        icon={<BrainCircuit size={22} />}
        badge="Powered by Claude"
        title="La IA que lee tu comportamiento, no solo tus gráficos."
        body="Claude analiza tu historial completo — números y texto — y detecta patrones como FOMO, revenge trading y sobreoperar antes de que se conviertan en pérdidas crónicas."
        illustration={<AiInsightIllustration />}
      />

      {/* Row 3 — Mentor */}
      <FeatureRow
        icon={<Eye size={22} />}
        badge="Pro"
        title="Un segundo par de ojos sobre tus operaciones."
        body="Asigna un mentor para que revise y anote tus operaciones. Acceso de solo lectura — tus datos siempre bajo tu control. El mentor no puede modificar nada, solo comentar."
        illustration={<MentorIllustration />}
      />

      {/* Row 4 — Dashboard */}
      <FeatureRow
        reverse
        icon={<BarChart2 size={22} />}
        badge="Tiempo real"
        title="Tu rendimiento, en datos que puedes leer."
        body="Curva P&L, heatmap de actividad, win rate y más. Todo filtrable por fecha y activo. Ve exactamente en qué momento del día y de la semana rindes mejor."
        illustration={<DashboardIllustration />}
      />

      {/* CTA band */}
      <section className="py-20 lg:py-28 bg-dark">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-sans text-[28px] lg:text-[36px] font-bold text-text-dark-primary leading-[1.1] tracking-[-0.015em] mb-4">
            Empieza a entender tu trading hoy.
          </h2>
          <p className="font-sans text-[15px] text-text-dark-secondary leading-relaxed mb-8 max-w-[440px] mx-auto">
            Sin tarjeta de crédito. Sin permanencia. La cuenta gratuita incluye el diario y el dashboard básico.
          </p>
          <Link
            href={`${APP_URL}/registro`}
            className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-8 py-3 transition-colors duration-150"
          >
            Empezar gratis
          </Link>
        </div>
      </section>
    </div>
  );
}

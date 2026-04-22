import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre Tradalyst — El diario que detecta lo que tú no ves",
  description:
    "Tradalyst nació de la frustración de un trader con las hojas de cálculo. Una persona, un proyecto, una herramienta honesta.",
};

export default function SobreNosotros() {
  return (
    <div className="bg-light min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">Sobre Tradalyst</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
            El diario que detecta lo que tú no ves.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 space-y-10">

          <div>
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              Cómo empezó esto
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Tradalyst empezó con una hoja de cálculo y mucha frustración.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Llevaba meses intentando llevar un diario de trading en Excel. Tenía columnas para el activo, el precio de entrada, el precio de salida, el P&L. Era correcto en lo técnico y completamente inútil en lo que importaba: entender por qué tomaba las decisiones que tomaba.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Lo que necesitaba no era más filas — era análisis. Saber en qué momento del día perdía más. Saber si mis operaciones &ldquo;de convicción&rdquo; tenían realmente mejor resultado que las que abría por impulso. Saber qué patrón se repetía semana tras semana sin que yo lo viera.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Esa pregunta se convirtió en Tradalyst. Un diario que no solo almacena datos — los analiza.
              </p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              Un proyecto, una persona
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Tradalyst es el proyecto de DAW Final de Digitech FP, en Málaga. Lo construyó una persona — diseño, backend, frontend, base de datos, integración de IA, despliegue en producción.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                No es un producto de una startup con ronda de financiación. Es una herramienta construida porque hacía falta, por alguien que opera en los mismos mercados que tú.
              </p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              La tecnología, sin rodeos
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Tradalyst está construido con Next.js en el frontend y Django en el backend, con PostgreSQL como base de datos. La autenticación usa JWT en cookies httpOnly — sin tokens en localStorage, sin datos expuestos al cliente.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Los precios en tiempo real provienen de CoinGecko (crypto) y Finnhub (forex y acciones), siempre a través del backend — nunca desde el navegador.
              </p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
                Para el análisis de comportamiento, Tradalyst usa{" "}
                <strong className="text-text font-semibold">Claude, desarrollado por Anthropic</strong> — la misma IA que usan empresas como Slack, Notion y Quora. Claude analiza el historial de operaciones completo, incluyendo el razonamiento y el estado emocional registrado por el trader, para detectar patrones que los números solos no revelan.
              </p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              Tus datos son tuyos
            </h2>
            <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
              Tu historial de operaciones, tus análisis, tus conversaciones con la IA — todo pertenece a tu cuenta y solo a tu cuenta. Puedes exportarlo en cualquier momento. Si decides cerrar tu cuenta, tus datos se eliminan. Sin excepciones.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              Contacto
            </h2>
            <p className="font-sans text-[15px] text-text-secondary leading-relaxed mb-2">
              Para cualquier consulta, feedback o reporte de problemas:
            </p>
            <a
              href="mailto:hola@tradalyst.com"
              className="font-mono text-[13px] text-green hover:underline"
            >
              hola@tradalyst.com
            </a>
          </div>

          {/* CTA */}
          <div className="border-t border-black/[0.08] pt-10">
            <Link
              href="https://app.tradalyst.com/registro"
              className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-6 py-3 rounded transition-colors duration-150"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

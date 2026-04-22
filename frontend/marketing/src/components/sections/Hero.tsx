import DashboardMockup from "@/components/ui/DashboardMockup";
import { APP_URL } from "@/lib/urls";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-light flex items-center pt-16 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 w-full py-24 lg:py-0 lg:min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — text content */}
          <div>
            <p className="eyebrow opacity-0 animate-fade-up animate-delay-100">
              Diario de trading · IA conductual
            </p>

            <h1
              className="font-sans font-bold text-text leading-[1.08] tracking-[-0.025em] mt-5 opacity-0 animate-fade-up animate-delay-200"
              style={{ fontSize: "clamp(36px, 4.5vw, 54px)" }}
            >
              El diario que detecta<br className="hidden sm:block" />
              {" "}lo que tú no ves.
            </h1>

            <p className="font-sans text-[17px] text-text-secondary leading-relaxed mt-5 max-w-[460px] opacity-0 animate-fade-up animate-delay-350">
              Registra tus operaciones, añade tu razonamiento, y deja que la
              IA encuentre los patrones que te están costando dinero.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8 opacity-0 animate-fade-up animate-delay-480">
              <a
                href={`${APP_URL}/registro`}
                className="font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[11px] rounded transition-colors duration-150"
              >
                Empezar gratis
              </a>
              <a
                href="#how"
                className="font-sans text-sm font-medium text-text-secondary hover:text-text border border-black/[0.15] px-5 py-[11px] rounded transition-colors duration-150"
              >
                Ver cómo funciona
              </a>
            </div>

            {/* Social proof hint */}
            <p className="font-mono text-[10px] text-text-muted mt-6 opacity-0 animate-fade-up animate-delay-480">
              2.400+ traders · Sin tarjeta de crédito
            </p>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex justify-center lg:justify-end opacity-0 animate-slide-up animate-delay-600">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

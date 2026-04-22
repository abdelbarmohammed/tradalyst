import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Funcionalidades — Tradalyst",
};

export default function Funcionalidades() {
  return (
    <div className="bg-light min-h-screen">
      <section className="py-20 lg:py-32 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 text-center">
          <p className="eyebrow mb-4">Funcionalidades</p>
          <h1 className="font-sans text-[36px] lg:text-[48px] font-bold text-text leading-[1.05] tracking-[-0.02em] mb-5">
            Próximamente.
          </h1>
          <p className="font-sans text-[16px] text-text-secondary leading-relaxed mb-10 max-w-[480px] mx-auto">
            Capturas reales de la app en construcción. Esta página se actualizará cuando la aplicación esté lista para mostrar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#how"
              className="inline-block font-sans text-sm font-semibold border border-black/[0.15] hover:border-black/[0.3] text-text px-6 py-3 rounded transition-colors duration-150"
            >
              Ver cómo funciona
            </Link>
            <Link
              href="https://app.tradalyst.com/registro"
              className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-6 py-3 rounded transition-colors duration-150"
            >
              Probar gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

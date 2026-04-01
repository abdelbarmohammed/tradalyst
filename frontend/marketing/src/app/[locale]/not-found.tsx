import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-light min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-green mb-6">404</p>
        <h1 className="font-sans text-[36px] lg:text-[44px] font-bold text-text leading-[1.05] tracking-[-0.02em] mb-4">
          Página no encontrada.
        </h1>
        <p className="font-sans text-[15px] text-text-secondary leading-relaxed mb-8">
          La URL que buscas no existe o ha cambiado. Puede que hayas seguido un enlace antiguo.
        </p>
        <Link
          href="/"
          className="inline-block font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white px-6 py-3 transition-colors duration-150"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

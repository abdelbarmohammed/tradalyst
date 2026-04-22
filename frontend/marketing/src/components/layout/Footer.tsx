import Link from "next/link";
import Logo from "@/components/ui/Logo";

const FOOTER_LINKS = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre-nosotros", label: "Nosotros" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
          {/* Brand */}
          <div className="flex flex-col gap-2 md:mr-12">
            <Logo variant="dark" height={20} />
            <p className="font-mono text-[10px] text-text-muted leading-relaxed max-w-[220px]">
              El diario que detecta lo que tú no ves.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 md:flex-1 md:justify-center">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm text-text-secondary hover:text-text transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="font-mono text-[10px] text-text-muted md:ml-auto">
            © Tradalyst 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

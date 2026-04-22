"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { APP_URL } from "@/lib/urls";

const NAV_LINKS = [
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/precios", label: "Precios" },
  { href: "/blog", label: "Blog" },
  { href: "/sobre-nosotros", label: "Nosotros" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 ${
        scrolled ? "nav-scrolled border-b border-black/[0.06]" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Tradalyst — inicio">
          <Logo variant="dark" height={22} />
        </Link>

        {/* Centre links — desktop */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-medium text-text-secondary hover:text-text transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions — desktop */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto">
          <Link
            href={`${APP_URL}/login`}
            className="font-sans text-sm font-medium text-text-secondary hover:text-text transition-colors duration-150 px-3 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href={`${APP_URL}/registro`}
            className="font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-4 py-2 rounded transition-colors duration-150"
          >
            Empezar gratis
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-auto p-2 text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-black/[0.06] bg-surface px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm font-medium text-text hover:text-green transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-black/[0.06] flex flex-col gap-2">
            <Link
              href={`${APP_URL}/login`}
              className="font-sans text-sm font-medium text-text-secondary py-2"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href={`${APP_URL}/registro`}
              className="font-sans text-sm font-semibold bg-green text-white px-4 py-2 rounded text-center"
              onClick={() => setMobileOpen(false)}
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

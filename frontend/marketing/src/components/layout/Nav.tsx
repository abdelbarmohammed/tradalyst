"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Link, usePathname } from "@/i18n/navigation";
import { APP_URL } from "@/lib/urls";

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_LINKS = [
    { href: "/funcionalidades", label: t("features") },
    { href: "/precios", label: t("pricing") },
    { href: "/blog", label: t("blog") },
    { href: "/sobre-nosotros", label: t("about") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 ${
        scrolled ? "nav-scrolled border-b border-black/[0.06]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Tradalyst">
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
          {/* Language toggle */}
          <div className="flex items-center gap-1 mr-1">
            <Link
              href={pathname}
              locale="es"
              className={`font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 transition-colors duration-150 ${
                locale === "es" ? "text-text font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              ES
            </Link>
            <span className="font-mono text-[10px] text-text-muted">|</span>
            <Link
              href={pathname}
              locale="en"
              className={`font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 transition-colors duration-150 ${
                locale === "en" ? "text-text font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              EN
            </Link>
          </div>

          <a
            href={`${APP_URL}/login?lang=${locale}`}
            className="font-sans text-sm font-medium text-text-secondary hover:text-text transition-colors duration-150 px-3 py-2"
          >
            {t("login")}
          </a>
          <a
            href={`${APP_URL}/registro?lang=${locale}`}
            className="font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-4 py-2 rounded transition-colors duration-150"
          >
            {t("signup")}
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-auto p-2 text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
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
            {/* Language toggle mobile */}
            <div className="flex items-center gap-2">
              <Link
                href={pathname}
                locale="es"
                className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                  locale === "es" ? "text-text font-semibold" : "text-text-muted"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                ES
              </Link>
              <span className="font-mono text-[10px] text-text-muted">|</span>
              <Link
                href={pathname}
                locale="en"
                className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                  locale === "en" ? "text-text font-semibold" : "text-text-muted"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                EN
              </Link>
            </div>
            <a
              href={`${APP_URL}/login?lang=${locale}`}
              className="font-sans text-sm font-medium text-text-secondary py-2"
              onClick={() => setMobileOpen(false)}
            >
              {t("login")}
            </a>
            <a
              href={`${APP_URL}/registro?lang=${locale}`}
              className="font-sans text-sm font-semibold bg-green text-white px-4 py-2 rounded text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t("signup")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

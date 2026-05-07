import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const t = useTranslations("footer");

  const productLinks = [
    { href: "/funcionalidades", label: t("links.features") },
    { href: "/precios", label: t("links.pricing") },
    { href: "/blog", label: t("links.blog") },
    { href: "/sobre-nosotros", label: t("links.about") },
  ];

  const legalLinks = [
    { href: "/privacidad", label: t("links.privacy") },
    { href: "/terminos", label: t("links.terms") },
    { href: "/cookies", label: t("links.cookies") },
  ];

  return (
    <footer className="bg-surface border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-14 pb-8">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 pb-12 border-b border-black/[0.08]">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Logo variant="dark" height={20} />
            <p className="font-mono text-[10px] text-text-muted leading-relaxed max-w-[220px]">
              {t("tagline")}
            </p>
            <a
              href={`mailto:${t("email")}`}
              className="font-mono text-[10px] text-text-muted hover:text-text transition-colors duration-150"
            >
              {t("email")}
            </a>
            <p className="font-mono text-[10px] text-text-muted">{t("copyright")}</p>
          </div>

          {/* Product column */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-text mb-5">
              {t("productHeading")}
            </p>
            <nav className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[13px] text-text-secondary hover:text-text transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal column */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-text mb-5">
              {t("legalHeading")}
            </p>
            <nav className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[13px] text-text-secondary hover:text-text transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6">
          <p className="font-mono text-[10px] text-text-muted">{t("madeIn")}</p>
          <p className="font-mono text-[10px] text-text-muted">{t("poweredBy")}</p>
        </div>
      </div>
    </footer>
  );
}

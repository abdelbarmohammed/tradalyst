import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const t = useTranslations("footer");

  const FOOTER_LINKS = [
    { href: "/funcionalidades", label: t("links.features") },
    { href: "/precios", label: t("links.pricing") },
    { href: "/blog", label: t("links.blog") },
    { href: "/sobre-nosotros", label: t("links.about") },
    { href: "/privacidad", label: t("links.privacy") },
    { href: "/terminos", label: t("links.terms") },
    { href: "/cookies", label: t("links.cookies") },
  ];

  return (
    <footer className="bg-white border-t border-black/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
          {/* Brand */}
          <div className="flex flex-col gap-2 md:mr-12">
            <Logo variant="dark" height={20} />
            <p className="font-mono text-[10px] text-text-muted leading-relaxed max-w-[220px]">
              {t("tagline")}
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
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

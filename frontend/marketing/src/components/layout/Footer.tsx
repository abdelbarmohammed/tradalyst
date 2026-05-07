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
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-10 md:pt-20 md:pb-[60px]">

        {/* ── Desktop layout (md+) ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-12">

          {/* Column 1 — Brand */}
          <div>
            <div className="mb-4">
              <Logo variant="dark" height={28} />
            </div>
            <p className="font-sans text-[15px] text-[#4b5563] leading-[1.6] max-w-[240px] mb-5">
              {t("tagline")}
            </p>
            <a
              href={`mailto:${t("email")}`}
              className="font-mono text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150"
            >
              {t("email")}
            </a>
          </div>

          {/* Column 2 — Product */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-5">
              {t("productHeading")}
            </p>
            <nav className="flex flex-col">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[15px] text-[#4b5563] hover:text-green transition-colors duration-150 leading-[36px]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 — Legal */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-5">
              {t("legalHeading")}
            </p>
            <nav className="flex flex-col">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[15px] text-[#4b5563] hover:text-green transition-colors duration-150 leading-[36px]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop bottom bar */}
        <div className="hidden md:flex justify-between mt-[60px] border-t border-black/[0.08] pt-6">
          <p className="font-mono text-[13px] text-[#9ca3af]">{t("copyright")}</p>
          <p className="font-mono text-[13px] text-[#9ca3af]">{t("madeIn")}</p>
        </div>

        {/* ── Mobile layout (below md) ── */}
        <div className="md:hidden">

          {/* Logo */}
          <div className="mb-3">
            <Logo variant="dark" height={28} />
          </div>

          {/* Tagline */}
          <p className="font-sans text-[15px] text-[#4b5563] leading-[1.6] mb-2">
            {t("tagline")}
          </p>

          {/* Email */}
          <a
            href={`mailto:${t("email")}`}
            className="font-mono text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 block mb-10"
          >
            {t("email")}
          </a>

          <div className="border-t border-black/[0.08] mb-8" />

          {/* Product links */}
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-4">
            {t("productHeading")}
          </p>
          <nav className="flex flex-col mb-8">
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[15px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-black/[0.08] mb-8" />

          {/* Legal links */}
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9ca3af] mb-4">
            {t("legalHeading")}
          </p>
          <nav className="flex flex-col mb-10">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[15px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-black/[0.08] mb-5" />

          <p className="font-mono text-[12px] text-[#9ca3af] mb-2">{t("copyright")}</p>
          <p className="font-mono text-[12px] text-[#9ca3af]">{t("madeIn")}</p>
        </div>

      </div>
    </footer>
  );
}

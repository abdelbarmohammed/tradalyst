import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";
import { APP_URL } from "@/lib/urls";

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

  const colLabelClass = "font-mono text-[11px] uppercase tracking-[0.1em] text-[#9ca3af] mb-4";
  const navLinkClass  = "font-sans text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 leading-[2]";

  return (
    <footer className="bg-surface border-t border-black/[0.08]">
      <div className="max-w-[1280px] mx-auto px-8 pt-16">

        {/* ── Desktop (md+) ── */}
        <div className="hidden md:flex justify-between items-start">

          {/* Left — Brand */}
          <div style={{ width: "40%" }}>
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-150">
              <Logo variant="dark" height={28} />
            </Link>
            <p className="font-sans text-[15px] text-[#4b5563] leading-[1.6] max-w-[280px] mt-3">
              {t("tagline")}
            </p>
          </div>

          {/* Right — 4 link columns */}
          <div className="grid grid-cols-4 gap-8" style={{ width: "55%" }}>

            {/* Producto */}
            <div>
              <p className={colLabelClass}>{t("productHeading")}</p>
              <nav className="flex flex-col">
                {productLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={navLinkClass}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className={colLabelClass}>{t("legalHeading")}</p>
              <nav className="flex flex-col">
                {legalLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={navLinkClass}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Soporte */}
            <div>
              <p className={colLabelClass}>{t("supportHeading")}</p>
              <a
                href={`mailto:${t("email")}`}
                className="font-mono text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 leading-[2] block"
              >
                {t("email")}
              </a>
            </div>

            {/* App */}
            <div>
              <p className={colLabelClass}>{t("appHeading")}</p>
              <div className="flex flex-col">
                <a
                  href={`${APP_URL}/registro`}
                  className="font-sans text-[14px] font-semibold text-green hover:opacity-75 transition-opacity duration-150 leading-[2]"
                >
                  {t("startFree")} →
                </a>
                <a
                  href={`${APP_URL}/login`}
                  className={navLinkClass}
                >
                  {t("signIn")} →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop bottom bar */}
        <div className="hidden md:flex justify-between mt-12 border-t border-black/[0.08] pt-6 pb-10">
          <p className="font-mono text-[12px] text-[#9ca3af]">{t("rights")}</p>
          <p className="font-mono text-[12px] text-[#9ca3af]">{t("location")}</p>
        </div>

        {/* ── Mobile (below md) — all centered ── */}
        <div className="md:hidden text-center pb-10">

          {/* Logo */}
          <div className="mb-3">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-150">
              <Logo variant="dark" height={28} />
            </Link>
          </div>

          {/* Tagline */}
          <p className="font-sans text-[14px] text-[#4b5563] leading-[1.6] mb-10">
            {t("tagline")}
          </p>

          <div className="border-t border-black/[0.08] mb-8" />

          {/* Producto */}
          <div className="mb-8">
            <p className={colLabelClass}>{t("productHeading")}</p>
            <nav className="flex flex-col items-center">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] flex items-center"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="mb-8">
            <p className={colLabelClass}>{t("legalHeading")}</p>
            <nav className="flex flex-col items-center">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] flex items-center"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Soporte */}
          <div className="mb-8">
            <p className={colLabelClass}>{t("supportHeading")}</p>
            <a
              href={`mailto:${t("email")}`}
              className="font-mono text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] inline-flex items-center"
            >
              {t("email")}
            </a>
          </div>

          {/* App */}
          <div className="mb-8">
            <p className={colLabelClass}>{t("appHeading")}</p>
            <div className="flex flex-col items-center">
              <a
                href={`${APP_URL}/registro`}
                className="font-sans text-[14px] font-semibold text-green hover:opacity-75 transition-opacity duration-150 min-h-[44px] flex items-center"
              >
                {t("startFree")} →
              </a>
              <a
                href={`${APP_URL}/login`}
                className="font-sans text-[14px] text-[#4b5563] hover:text-green transition-colors duration-150 min-h-[44px] flex items-center"
              >
                {t("signIn")} →
              </a>
            </div>
          </div>

          <div className="border-t border-black/[0.08] mb-5" />

          <div className="flex flex-col items-center gap-1">
            <p className="font-mono text-[12px] text-[#9ca3af]">{t("rights")}</p>
            <p className="font-mono text-[12px] text-[#9ca3af]">{t("location")}</p>
          </div>
        </div>

      </div>
    </footer>
  );
}

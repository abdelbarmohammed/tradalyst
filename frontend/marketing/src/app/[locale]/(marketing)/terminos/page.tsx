import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("title") };
}

export default async function TerminosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <div className="bg-light min-h-screen">
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
            {t("heading")}
          </h1>
          <p className="font-mono text-[11px] text-text-muted mt-4">{t("updated")}</p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="font-sans text-[15px] text-text-secondary leading-relaxed">
            {locale === "en"
              ? "Terms of use will be published before the public launch. If you have questions, contact hola@tradalyst.com."
              : "Los términos de uso serán publicados antes del lanzamiento público. Si tienes preguntas, contacta con hola@tradalyst.com."}
          </p>
        </div>
      </section>
    </div>
  );
}

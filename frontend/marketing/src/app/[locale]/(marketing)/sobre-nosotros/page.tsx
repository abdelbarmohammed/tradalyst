import { getTranslations } from "next-intl/server";
import { APP_URL } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("description") };
}

export default async function SobreNosotros({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="bg-light min-h-screen">
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
            {t("heading")}
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 space-y-10">
          <div>
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              {t("howItStarted.title")}
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("howItStarted.p1")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("howItStarted.p2")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("howItStarted.p3")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("howItStarted.p4")}</p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              {t("oneProject.title")}
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("oneProject.p1")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("oneProject.p2")}</p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              {t("whatWeBelieve.title")}
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("whatWeBelieve.p1")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("whatWeBelieve.p2")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("whatWeBelieve.p3")}</p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              {t("techStack.title")}
            </h2>
            <div className="space-y-4">
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("techStack.p1")}</p>
              <p className="font-sans text-[15px] text-text-secondary leading-relaxed">{t("techStack.p2")}</p>
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-4">
              {t("cta.title")}
            </h2>
            <p className="font-sans text-[15px] text-text-secondary leading-relaxed mb-6">
              {t("cta.description")}
            </p>
            <a
              href={`${APP_URL}/registro?lang=${locale}`}
              className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-6 py-3 rounded transition-colors duration-150"
            >
              {t("cta.button")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

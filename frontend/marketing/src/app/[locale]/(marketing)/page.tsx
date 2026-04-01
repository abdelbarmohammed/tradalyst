import { getTranslations } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import AiSpotlight from "@/components/sections/AiSpotlight";
import AnalyticsPreview from "@/components/sections/AnalyticsPreview";
import FeatureGrid from "@/components/sections/FeatureGrid";
import Testimonials from "@/components/sections/Testimonials";
import PricingPreview from "@/components/sections/PricingPreview";
import FinalCta from "@/components/sections/FinalCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return { title: t("title"), description: t("description") };
}

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Tradalyst",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description: "Diario de trading con análisis de comportamiento por inteligencia artificial",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "EUR", name: "Free" },
    { "@type": "Offer", price: "9.99", priceCurrency: "EUR", name: "Pro", billingDuration: "P1M" },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_SCHEMA) }}
      />
      <Hero />
      <TrustBar />
      <Problem />
      <HowItWorks />
      <AiSpotlight />
      <AnalyticsPreview />
      <FeatureGrid />
      <Testimonials />
      <PricingPreview />
      <FinalCta />
    </>
  );
}

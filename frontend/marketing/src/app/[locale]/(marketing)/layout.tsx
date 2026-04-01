import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleAnalytics />
      <Nav />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}

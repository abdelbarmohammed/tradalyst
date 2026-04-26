import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tradalyst — Tu diario de trading con IA",
  description:
    "Registra tus operaciones, detecta patrones de comportamiento y mejora tu rendimiento con análisis de IA.",
};

const VALID_LOCALES = ["es", "en"] as const;
type Locale = (typeof VALID_LOCALES)[number];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value ?? "es";
  const locale: Locale = VALID_LOCALES.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "es";

  const messages = (await import(`../../messages/${locale}.json`)).default;

  const theme = cookieStore.get("THEME")?.value === "light" ? "light" : "dark";

  return (
    <html lang={locale} className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${theme}`}>
      <body className="font-sans antialiased" style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
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
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "es";
  const locale: Locale = VALID_LOCALES.includes(raw as Locale) ? (raw as Locale) : "es";
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans bg-base text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

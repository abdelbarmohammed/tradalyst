import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tradalyst — El diario que detecta lo que tú no ves.",
    template: "%s | Tradalyst",
  },
  description:
    "Registra tus operaciones, añade tu razonamiento, y deja que la IA encuentre los patrones que te están costando dinero.",
  metadataBase: new URL("https://tradalyst.com"),
  openGraph: {
    siteName: "Tradalyst",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased bg-light text-text">
        {children}
      </body>
    </html>
  );
}

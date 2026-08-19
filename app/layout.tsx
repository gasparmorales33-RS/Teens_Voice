import type { Metadata, Viewport } from "next";
import { Montserrat, Nunito_Sans } from "next/font/google";
import "./globals.css";

const titleFont = Montserrat({ variable: "--font-title", subsets: ["latin"] });
const bodyFont = Nunito_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IMAA Teens Voice",
  description:
    "Test anónimo de experiencia estudiantil del IMMA: la voz de los alumnos sobre su escuela, sus docentes y su comunidad.",
  applicationName: "IMAA Teens Voice",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "IMAA Teens Voice",
    description:
      "Test anónimo de experiencia estudiantil del IMMA: la voz de los alumnos sobre su escuela, sus docentes y su comunidad.",
    siteName: "IMAA Teens Voice",
    locale: "es_MX",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#151c62",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${titleFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}

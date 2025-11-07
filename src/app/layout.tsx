import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import YandexMetrika from '@/components/YandexMetrika';

const inter = localFont({
  src: "../../public/fonts/inter-v20-cyrillic_cyrillic-ext_latin-regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});

const manrope = localFont({
  src: [
    {
      path: "../../public/fonts/manrope-v20-cyrillic_cyrillic-ext_latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope-v20-cyrillic_cyrillic-ext_latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope-v20-cyrillic_cyrillic-ext_latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-manrope",
});

const circe = localFont({
  src: "../../public/fonts/Circe-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-circe",
});

const cofoRobert = localFont({
  src: "../../public/fonts/CoFo-Robert.woff2",
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-cofo-robert",
});

export const metadata: Metadata = {
  title: "Спецпроект Frank Media x Springle: «Рывок в карьере»",
  description:
    "Узнайте, как связаны разные виды физической активности и гибкие навыки, которые помогают расти по карьерной лестнице. В конце — дарим пробную тренировку.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${manrope.variable} ${circe.variable} ${cofoRobert.variable}`}
      >
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraKids — Вълшебни приказки за твоето дете",
  description: "Генерирай персонализирана приказка с името на детето си и уникални илюстрации. Нещо специално, само за него.",
  metadataBase: new URL("https://aurakids.fun"),
  openGraph: {
    title: "AuraKids — Вълшебни приказки за твоето дете",
    description: "Персонализирани детски приказки с AI илюстрации",
    url: "https://aurakids.fun",
    siteName: "AuraKids",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

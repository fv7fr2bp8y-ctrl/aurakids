import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import { BRAND, APP } from "@/lib/appConfig";

const IV = BRAND.iconVariant;
const TITLE = APP === "story"
  ? "AuraKids Приказки — вечерни приказки за твоето дете"
  : APP === "comic"
    ? "AuraKids Комикси — твоето дете е супергероят"
    : "AuraKids — Вълшебни приказки за твоето дете";
const DESC = APP === "comic"
  ? "Създай персонализиран комикс, в който детето ти е главният герой — цели страници с реплики и екшън."
  : "Генерирай персонализирана приказка с името на детето си и уникални илюстрации. Нещо специално, само за него.";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1A0533",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  metadataBase: new URL("https://aurakids.fun"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  icons: {
    icon: [
      { url: `/api/icon?size=32&app=${IV}&v=5`, sizes: "32x32", type: "image/png" },
      { url: `/api/icon?size=192&app=${IV}&v=5`, sizes: "192x192", type: "image/png" },
      { url: `/api/icon?size=512&app=${IV}&v=5`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `/api/icon?size=180&app=${IV}&v=5`, sizes: "180x180", type: "image/png" }],
    shortcut: `/api/icon?size=192&app=${IV}&v=5`,
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://aurakids.fun",
    siteName: BRAND.name,
    images: [{ url: "/api/og-image", width: 1200, height: 630, alt: BRAND.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/api/og-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}

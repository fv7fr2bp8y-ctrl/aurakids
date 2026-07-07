import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";

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
  title: "AuraKids — Вълшебни приказки за твоето дете",
  description: "Генерирай персонализирана приказка с името на детето си и уникални илюстрации. Нещо специално, само за него.",
  metadataBase: new URL("https://aurakids.fun"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AuraKids",
  },
  icons: {
    icon: [
      { url: "/api/icon?size=32", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?size=180", sizes: "180x180", type: "image/png" }],
    shortcut: "/api/icon?size=192",
  },
  openGraph: {
    title: "AuraKids — Вълшебни приказки за твоето дете",
    description: "Персонализирани детски приказки с AI — детето ти е главният герой",
    url: "https://aurakids.fun",
    siteName: "AuraKids",
    images: [{ url: "/api/og-image", width: 1200, height: 630, alt: "AuraKids" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraKids — Вълшебни приказки за твоето дете",
    description: "Персонализирани детски приказки с AI — детето ти е главният герой",
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

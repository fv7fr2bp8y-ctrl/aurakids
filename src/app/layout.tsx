import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import ConsentBanner from "@/components/ConsentBanner";
import ThanksTracker from "@/components/ThanksTracker";
import { GA_ID, bootScript } from "@/lib/analytics";
import { BRAND, APP } from "@/lib/appConfig";

const IV = BRAND.iconVariant;
const TITLE = APP === "story"
  ? "Приказка с името на детето, с картинки и глас | AuraKids"
  : APP === "comic"
    ? "Комикс, в който детето ти е супергероят | AuraKids"
    : "Чуй приказка, в която героят е твоето дете | AuraKids";
const DESC = APP === "comic"
  ? "Създай комикс, в който детето ти е главният герой: цели страници с реплики и екшън. Опитай безплатно."
  : "Вечерна приказка с името на детето ти, с уникални илюстрации и глас, готова за минута. Опитай безплатно.";
const OG_IMG = APP === "comic" ? "/og-comic.jpg" : "/og-story.jpg";

// Structured data for search engines (who we are, what it costs).
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://aurakids.fun/#org", name: "AuraKids", url: "https://aurakids.fun/",
      logo: "https://aurakids.fun/icon-512.png" },
    { "@type": "WebSite", "@id": "https://aurakids.fun/#site", name: "AuraKids", url: "https://aurakids.fun/",
      inLanguage: "bg", publisher: { "@id": "https://aurakids.fun/#org" } },
    { "@type": "WebApplication", name: "AuraKids", url: "https://aurakids.fun/", applicationCategory: "EntertainmentApplication",
      operatingSystem: "Web, Android", inLanguage: "bg",
      description: "Приказки и комикси с името на детето, с илюстрации и глас.",
      offers: [
        { "@type": "Offer", name: "Месечен абонамент", price: "4.99", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Годишен абонамент", price: "39.99", priceCurrency: "EUR" },
      ] },
  ],
};

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
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.name,
  },
  icons: {
    icon: [
      { url: `/api/icon?size=32&app=favicon&v=6`, sizes: "32x32", type: "image/png" },
      { url: `/api/icon?size=192&app=${IV}&v=5`, sizes: "192x192", type: "image/png" },
      { url: `/api/icon?size=512&app=${IV}&v=5`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `/api/icon?size=180&app=${IV}&v=5`, sizes: "180x180", type: "image/png" }],
    shortcut: `/api/icon?size=192&app=${IV}&v=5`,
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "/",
    siteName: BRAND.name,
    locale: "bg_BG",
    images: [{ url: OG_IMG, width: 1200, height: 630, alt: BRAND.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [OG_IMG],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${geist.variable} h-full antialiased`}>
      {GA_ID && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: bootScript() }} />
        </head>
      )}
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <ServiceWorker />
        <ConsentBanner />
        <ThanksTracker />
        {children}
      </body>
    </html>
  );
}

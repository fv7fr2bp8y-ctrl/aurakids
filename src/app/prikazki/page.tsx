import type { Metadata } from "next";
import HomeApp from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "Приказка с името на детето, с картинки и глас | AuraKids",
  description: "Вечерна приказка с името на детето ти, с уникални илюстрации и глас, готова за минута. Опитай безплатно.",
  alternates: { canonical: "/prikazki" },
  openGraph: {
    title: "Приказка с името на детето, с картинки и глас | AuraKids",
    description: "Вечерна приказка с името на детето ти, с уникални илюстрации и глас, готова за минута. Опитай безплатно.",
    url: "/prikazki",
    siteName: "AuraKids",
    locale: "bg_BG",
    type: "website",
    images: [{ url: "/og-story.jpg", width: 1200, height: 630, alt: "AuraKids" }],
  },
  twitter: { card: "summary_large_image", title: "Приказка с името на детето, с картинки и глас | AuraKids", description: "Вечерна приказка с името на детето ти, с уникални илюстрации и глас, готова за минута. Опитай безплатно.", images: ["/og-story.jpg"] },
  manifest: "/prikazki/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AuraKids Приказки" },
  icons: {
    icon: [
      { url: "/api/icon?size=32&app=story&v=8", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=192&app=story&v=8", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?size=180&app=story&v=8", sizes: "180x180", type: "image/png" }],
  },
};

export default function Prikazki() {
  return <HomeApp forced="story" />;
}

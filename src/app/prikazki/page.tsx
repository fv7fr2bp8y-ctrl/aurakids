import type { Metadata } from "next";
import HomeApp from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "AuraKids Приказки — вечерни приказки за твоето дете",
  description: "Персонализирани вечерни приказки с името на твоето дете — с илюстрации и глас.",
  manifest: "/prikazki/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AuraKids Приказки" },
  icons: {
    icon: [
      { url: "/api/icon?size=32&app=story&v=5", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=192&app=story&v=5", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?size=180&app=story&v=5", sizes: "180x180", type: "image/png" }],
  },
};

export default function Prikazki() {
  return <HomeApp forced="story" />;
}

import type { Metadata } from "next";
import HomeApp from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "Комикс, в който детето ти е супергероят | AuraKids",
  description: "Създай комикс, в който детето ти е главният герой: цели страници с реплики и екшън. Опитай безплатно.",
  alternates: { canonical: "/komiksi" },
  openGraph: {
    title: "Комикс, в който детето ти е супергероят | AuraKids",
    description: "Създай комикс, в който детето ти е главният герой: цели страници с реплики и екшън. Опитай безплатно.",
    url: "/komiksi",
    siteName: "AuraKids",
    locale: "bg_BG",
    type: "website",
    images: [{ url: "/og-comic.jpg", width: 1200, height: 630, alt: "AuraKids" }],
  },
  twitter: { card: "summary_large_image", title: "Комикс, в който детето ти е супергероят | AuraKids", description: "Създай комикс, в който детето ти е главният герой: цели страници с реплики и екшън. Опитай безплатно.", images: ["/og-comic.jpg"] },
  manifest: "/komiksi/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AuraKids Комикси" },
  icons: {
    icon: [
      { url: "/api/icon?size=32&app=comic&v=5", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=192&app=comic&v=5", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?size=180&app=comic&v=5", sizes: "180x180", type: "image/png" }],
  },
};

export default function Komiksi() {
  return <HomeApp forced="comic" />;
}

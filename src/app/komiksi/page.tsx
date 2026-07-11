import type { Metadata } from "next";
import HomeApp from "@/components/HomeApp";

export const metadata: Metadata = {
  title: "AuraKids Комикси — твоето дете е супергероят",
  description: "Персонализирани комикси, в които твоето дете е главният герой — цели страници с реплики и екшън.",
  manifest: "/komiksi/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AuraKids Комикси" },
  icons: {
    icon: [
      { url: "/api/icon?size=32&app=comic", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?size=192&app=comic", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?size=180&app=comic", sizes: "180x180", type: "image/png" }],
  },
};

export default function Komiksi() {
  return <HomeApp forced="comic" />;
}

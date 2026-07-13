import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/appConfig";

// Per-build PWA manifest — name, short_name and icons switch with NEXT_PUBLIC_APP
// so the story build and the comic build install as two distinct apps.
export default function manifest(): MetadataRoute.Manifest {
  const v = BRAND.iconVariant;
  const desc: Record<string, string> = {
    story: "Персонализирани вечерни приказки с името на твоето дете — с илюстрации и глас.",
    comic: "Персонализирани комикси, в които твоето дете е супергероят — цели страници с реплики и екшън.",
    both: "Персонализирани детски приказки и комикси с името на твоето дете.",
  };
  return {
    name: BRAND.name,
    short_name: BRAND.short,
    description: desc[v] ?? desc.both,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A0533",
    theme_color: "#1A0533",
    lang: "bg",
    icons: [
      { src: `/api/icon?size=192&app=${v}&v=5`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `/api/icon?size=512&app=${v}&v=5`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `/api/icon?size=192&app=${v}&padded=1&v=5`, sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: `/api/icon?size=512&app=${v}&padded=1&v=5`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

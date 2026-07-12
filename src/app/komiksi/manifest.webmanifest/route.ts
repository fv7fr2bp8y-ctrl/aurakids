import { NextResponse } from "next/server";

// Standalone PWA manifest for the Comics app (installs from /komiksi).
export function GET() {
  return NextResponse.json({
    id: "/komiksi",
    name: "AuraKids Комикси",
    short_name: "Комикси",
    description: "Комикси, в които твоето дете е супергероят — цели страници с реплики и екшън.",
    categories: ["education", "kids", "entertainment"],
    start_url: "/komiksi",
    scope: "/komiksi",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A0533",
    theme_color: "#1A0533",
    lang: "bg",
    icons: [
      { src: "/api/icon?size=192&app=comic", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/icon?size=512&app=comic", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/icon?size=192&app=comic&padded=1", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/icon?size=512&app=comic&padded=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json" } });
}

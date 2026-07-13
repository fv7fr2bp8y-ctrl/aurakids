import { NextResponse } from "next/server";

// Standalone PWA manifest for the Bedtime Stories app (installs from /prikazki).
export function GET() {
  return NextResponse.json({
    id: "/prikazki",
    name: "AuraKids Приказки",
    short_name: "Приказки",
    description: "Вечерни приказки с името на твоето дете — с илюстрации и глас.",
    categories: ["education", "kids", "entertainment"],
    start_url: "/prikazki",
    scope: "/prikazki",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A0533",
    theme_color: "#1A0533",
    lang: "bg",
    icons: [
      { src: "/api/icon?size=192&app=story&v=5", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/icon?size=512&app=story&v=5", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/icon?size=192&app=story&padded=1&v=5", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/icon?size=512&app=story&padded=1&v=5", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, { headers: { "Content-Type": "application/manifest+json" } });
}

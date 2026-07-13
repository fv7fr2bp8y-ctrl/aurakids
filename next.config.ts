import type { NextConfig } from "next";

// Which build this is (story | comic | both) — inlined at build time.
const APP = process.env.NEXT_PUBLIC_APP === "story" ? "story"
  : process.env.NEXT_PUBLIC_APP === "comic" ? "comic" : "both";

const nextConfig: NextConfig = {
  async rewrites() {
    // Serve every legacy icon path from this build's brand icon (via /api/icon),
    // so anything iOS/Android/browsers probe resolves to the right icon.
    return [
      { source: "/apple-touch-icon.png", destination: `/api/icon?size=180&app=${APP}` },
      { source: "/apple-touch-icon-precomposed.png", destination: `/api/icon?size=180&app=${APP}` },
      { source: "/icon-192.png", destination: `/api/icon?size=192&app=${APP}` },
      { source: "/icon-512.png", destination: `/api/icon?size=512&app=${APP}` },
      { source: "/icon-maskable-512.png", destination: `/api/icon?size=512&padded=1&app=${APP}` },
      { source: "/favicon.ico", destination: "/api/icon?size=32&app=favicon&v=5" },
      { source: "/favicon-32.png", destination: "/api/icon?size=32&app=favicon" },
      // Android TWA verification.
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
    ];
  },
};

export default nextConfig;

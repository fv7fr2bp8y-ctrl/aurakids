import type { NextConfig } from "next";

// Which build this is (story | comic | both) — inlined at build time.
const APP = process.env.NEXT_PUBLIC_APP === "story" ? "story"
  : process.env.NEXT_PUBLIC_APP === "comic" ? "comic" : "both";

const nextConfig: NextConfig = {
  // The voice's stress dictionary is read from disk by these API routes.
  outputFileTracingIncludes: {
    "/api/generate-story": ["./data/stress-bg.tsv.gz"],
    "/api/tts": ["./data/stress-bg.tsv.gz"],
  },
  // One address for search engines: www → aurakids.fun. The API (Stripe
  // webhook, app calls) and /.well-known (Android app links) stay on both.
  async redirects() {
    const www = [{ type: "host" as const, value: "www.aurakids.fun" }];
    return [
      { source: "/", has: www, destination: "https://aurakids.fun/", permanent: true },
      { source: "/:path((?!api/|\\.well-known/).+)", has: www, destination: "https://aurakids.fun/:path", permanent: true },
    ];
  },
  async rewrites() {
    // Serve every legacy icon path from this build's brand icon (via /api/icon),
    // so anything iOS/Android/browsers probe resolves to the right icon.
    return [
      { source: "/apple-touch-icon.png", destination: `/api/icon?size=180&app=${APP}` },
      { source: "/apple-touch-icon-precomposed.png", destination: `/api/icon?size=180&app=${APP}` },
      { source: "/icon-192.png", destination: `/api/icon?size=192&app=${APP}` },
      { source: "/icon-512.png", destination: `/api/icon?size=512&app=${APP}` },
      { source: "/icon-maskable-512.png", destination: `/api/icon?size=512&padded=1&app=${APP}` },
      { source: "/favicon.ico", destination: "/api/icon?size=32&app=favicon&v=6" },
      { source: "/favicon-32.png", destination: "/api/icon?size=32&app=favicon" },
      // Android TWA verification.
      { source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" },
    ];
  },
};

export default nextConfig;

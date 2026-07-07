import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Serve every legacy icon path from the brand-kit app icon (via /api/icon),
    // so anything iOS/Android/browsers probe resolves to the real icon.
    return [
      { source: "/apple-touch-icon.png", destination: "/api/icon?size=180" },
      { source: "/apple-touch-icon-precomposed.png", destination: "/api/icon?size=180" },
      { source: "/icon-192.png", destination: "/api/icon?size=192" },
      { source: "/icon-512.png", destination: "/api/icon?size=512" },
      { source: "/icon-maskable-512.png", destination: "/api/icon?size=512&padded=1" },
      { source: "/favicon-32.png", destination: "/api/icon?size=32" },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Serve every legacy icon path from the brand-kit app icon (via /api/icon),
    // so anything iOS/Android/browsers probe resolves to the real icon.
    return [
      { source: "/apple-touch-icon.png", destination: "/api/icon" },
      { source: "/apple-touch-icon-precomposed.png", destination: "/api/icon" },
      { source: "/icon-192.png", destination: "/api/icon" },
      { source: "/icon-512.png", destination: "/api/icon" },
      { source: "/icon-maskable-512.png", destination: "/api/icon" },
      { source: "/favicon-32.png", destination: "/api/icon" },
    ];
  },
};

export default nextConfig;

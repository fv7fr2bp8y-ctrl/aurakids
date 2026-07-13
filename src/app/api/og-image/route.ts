import { NextResponse } from "next/server";
import { getCachedImage } from "@/lib/supabase";

export const maxDuration = 10;

export async function GET() {
  const logoUrl = await getCachedImage("logo-mark-v4.png");

  const logoImg = logoUrl
    ? `<image href="${logoUrl}" x="80" y="160" width="260" height="260" />`
    : "";

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A0533"/>
      <stop offset="60%" stop-color="#3B1A6B"/>
      <stop offset="100%" stop-color="#6B35B8"/>
    </linearGradient>
    <radialGradient id="glow1" cx="30%" cy="50%" r="40%">
      <stop offset="0%" stop-color="rgba(255,107,107,0.18)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="40%" r="35%">
      <stop offset="0%" stop-color="rgba(255,217,61,0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- Stars -->
  <circle cx="120" cy="80" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="340" cy="45" r="1" fill="white" opacity="0.5"/>
  <circle cx="890" cy="60" r="2" fill="white" opacity="0.8"/>
  <circle cx="1050" cy="120" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="200" cy="520" r="1" fill="white" opacity="0.5"/>
  <circle cx="1100" cy="480" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="750" cy="30" r="1" fill="white" opacity="0.6"/>
  <circle cx="980" cy="550" r="2" fill="white" opacity="0.5"/>

  <!-- Logo image -->
  ${logoImg}

  <!-- Text block -->
  <text x="400" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">AuraKids</text>
  <text x="400" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="rgba(255,255,255,0.70)">Вълшебни приказки за твоето дете</text>

  <!-- Divider -->
  <line x1="400" y1="340" x2="900" y2="340" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

  <!-- Tagline -->
  <text x="400" y="395" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="rgba(255,255,255,0.50)">Детето ти е главният герой</text>

  <!-- CTA pill -->
  <rect x="400" y="430" width="280" height="56" rx="28" fill="url(#pill)"/>
  <defs>
    <linearGradient id="pill" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="100%" stop-color="#FFD93D"/>
    </linearGradient>
  </defs>
  <text x="540" y="465" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#3B1A6B" text-anchor="middle">aurakids.fun</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

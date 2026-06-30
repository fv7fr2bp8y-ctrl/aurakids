"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const FALLBACK = (size: number) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="al-g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF6B6B"/>
        <stop offset="100%" stopColor="#FFD93D"/>
      </linearGradient>
      <linearGradient id="al-g2" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#9B6FE8"/>
        <stop offset="100%" stopColor="#5B21B6"/>
      </linearGradient>
    </defs>
    <path d="M7 37 L7 17 C7 15.5 8.5 14.5 10 15.2 C14.5 17.2 21 19.5 28 20.5 L28 40.5 C21 39.5 14.5 37 10 35 C8.5 34.3 7 35 7 37Z" fill="url(#al-g2)"/>
    <path d="M49 37 L49 17 C49 15.5 47.5 14.5 46 15.2 C41.5 17.2 35 19.5 28 20.5 L28 40.5 C35 39.5 41.5 37 46 35 C47.5 34.3 49 35 49 37Z" fill="url(#al-g2)" opacity="0.65"/>
    <line x1="28" y1="20" x2="28" y2="41" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 3 L30.2 9.8 L37.4 9.8 L31.6 13.9 L33.8 20.7 L28 16.6 L22.2 20.7 L24.4 13.9 L18.6 9.8 L25.8 9.8Z" fill="url(#al-g1)"/>
  </svg>
);

let cachedUrl: string | null = null;

export default function AuraLogo({ size = 36 }: { size?: number }) {
  const [url, setUrl] = useState<string | null>(cachedUrl);

  useEffect(() => {
    if (cachedUrl) return;
    fetch("/api/logo-url")
      .then((r) => r.json())
      .then((d) => {
        if (d.url) { cachedUrl = d.url; setUrl(d.url); }
      })
      .catch(() => {});
  }, []);

  if (!url) return FALLBACK(size);

  return (
    <Image src={url} alt="AuraKids" width={size} height={size} className="object-contain" unoptimized />
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const [heroUrl, setHeroUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hero-image")
      .then((r) => r.json())
      .then((d) => d.url && setHeroUrl(d.url))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(59,26,107,0.90)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AuraKids</span>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", color: "#3B1A6B" }}
        >
          Създай приказка
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: "linear-gradient(160deg, #1A0533 0%, #3B1A6B 50%, #6B35B8 100%)" }}>

        {/* Subtle star dots */}
        <div className="absolute inset-0 stars-bg pointer-events-none opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,107,107,0.12), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,217,61,0.10), transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{ background: "rgba(255,217,61,0.15)", color: "#FFD93D", border: "1px solid rgba(255,217,61,0.3)" }}>
              Магически персонализирани приказки
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Приказка само
              <br />
              <span className="shimmer-text">за твоето дете</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Въведи името му и за секунди се ражда вълшебна история — с него като герой, уникални илюстрации и глас.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={onStart}
                className="px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                  color: "#3B1A6B",
                  boxShadow: "0 8px 32px rgba(255,107,107,0.35)",
                }}
              >
                Създай безплатно
              </button>
              <div className="flex items-center gap-3 py-2">
                <div className="flex -space-x-2">
                  {["#FF6B6B", "#9B6FE8", "#4FC3F7"].map((c) => (
                    <div key={c} className="w-9 h-9 rounded-full border-2 border-purple-900"
                      style={{ background: c, opacity: 0.85 }} />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">1,200+ приказки</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>създадени тази седмица</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-8">
              {[["Безплатно", "#FF6B6B"], ["На български", "#FFD93D"], ["30 секунди", "#4FC3F7"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero illustration */}
          <div className="relative flex items-center justify-center animate-scale-in">
            <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)" }}>
              {heroUrl ? (
                <Image src={heroUrl} alt="AuraKids" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3B1A6B, #6B35B8)" }}>
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-white/40 text-sm">Зарежда илюстрация...</span>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 glass-dark rounded-2xl px-4 py-2.5">
                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Приказка за</div>
                <div className="text-base font-bold text-white">Александър</div>
              </div>
              <div className="absolute bottom-4 right-4 glass-dark rounded-2xl px-4 py-2.5 text-right">
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Тема</div>
                <div className="text-base font-bold text-white">Дракони</div>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-3xl border opacity-10 animate-spin-slow pointer-events-none"
              style={{ borderColor: "#FFD93D", borderStyle: "dashed" }} />
          </div>
        </div>
      </section>
    </>
  );
}

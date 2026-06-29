"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function AuraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#FFD93D" />
        </linearGradient>
      </defs>
      {/* Open book */}
      <path d="M24 36 C24 36 10 30 6 18 L6 14 C6 14 10 12 24 18 C38 12 42 14 42 14 L42 18 C38 30 24 36 24 36Z"
        fill="url(#logoGrad)" opacity="0.9" />
      <path d="M24 36 L24 18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      {/* Star above */}
      <path d="M24 6 L25.5 10 L30 10 L26.5 12.5 L28 16.5 L24 14 L20 16.5 L21.5 12.5 L18 10 L22.5 10Z"
        fill="white" opacity="0.95" />
    </svg>
  );
}

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
        style={{ background: "rgba(26,5,51,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <AuraLogo size={36} />
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

        <div className="absolute inset-0 stars-bg pointer-events-none opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,107,107,0.12), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,217,61,0.10), transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold tracking-wide"
              style={{ background: "rgba(255,217,61,0.12)", color: "#FFD93D", border: "1px solid rgba(255,217,61,0.25)" }}>
              Персонализирани приказки с изкуствен интелект
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-7">
              Само едно дете
              <br />
              е героят.
              <br />
              <span className="shimmer-text">Твоето.</span>
            </h1>

            <p className="text-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: 480 }}>
              Въведи името му — и за минута се ражда приказка, написана само за него. С него като главен герой. С илюстрации. С глас.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
              <button
                onClick={onStart}
                className="px-9 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                  color: "#3B1A6B",
                  boxShadow: "0 12px 40px rgba(255,107,107,0.40)",
                  letterSpacing: "-0.01em",
                }}
              >
                Създай приказката — безплатно
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {[["Напълно безплатно", "#FF6B6B"], ["На български", "#FFD93D"], ["Готово за 60 сек", "#4FC3F7"], ["Никога повторена", "#9B6FE8"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero illustration */}
          <div className="relative flex items-center justify-center animate-scale-in">
            <div className="relative w-full max-w-lg"
              style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.6))" }}>

              <div className="relative w-full rounded-3xl overflow-hidden"
                style={{
                  aspectRatio: "16/10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 0 80px rgba(107,53,184,0.3)",
                }}>
                {heroUrl ? (
                  <Image src={heroUrl} alt="AuraKids магическа илюстрация" fill className="object-cover" unoptimized />
                ) : (
                  /* Beautiful placeholder while DALL-E generates */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                    style={{ background: "linear-gradient(145deg, #2D0F55, #6B35B8, #9B6FE8)" }}>
                    <div className="absolute inset-0 stars-bg opacity-70" />
                    {/* Animated glow orb */}
                    <div className="absolute w-40 h-40 rounded-full blur-3xl animate-float-slow"
                      style={{ background: "radial-gradient(circle, rgba(255,217,61,0.3), rgba(255,107,107,0.2), transparent)" }} />
                    <AuraLogo size={64} />
                    <div className="text-center relative z-10">
                      <div className="text-white font-semibold text-base mb-1">Зарежда илюстрация...</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Първото зареждане отнема ~20 сек</div>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-2 relative z-10">
                      {[0, 0.3, 0.6].map((d) => (
                        <div key={d} className="w-2 h-2 rounded-full animate-twinkle"
                          style={{ background: "#FFD93D", animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass-dark rounded-2xl px-4 py-2.5 animate-float"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Тема</div>
                <div className="text-sm font-bold text-white">Дракони</div>
              </div>

              <div className="absolute -bottom-4 -left-4 glass-dark rounded-2xl px-4 py-2.5 animate-float"
                style={{ border: "1px solid rgba(255,255,255,0.1)", animationDelay: "1.5s" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Герой</div>
                <div className="text-sm font-bold text-white">Александър</div>
              </div>
            </div>

            <div className="absolute -inset-6 rounded-3xl border opacity-10 animate-spin-slow pointer-events-none"
              style={{ borderColor: "#FFD93D", borderStyle: "dashed" }} />
          </div>
        </div>
      </section>
    </>
  );
}

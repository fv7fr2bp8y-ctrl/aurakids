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
        style={{ background: "rgba(59,26,107,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <span className="text-xl font-bold text-white tracking-tight">AuraKids</span>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", color: "#3B1A6B" }}
        >
          Създай приказка ✨
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20"
        style={{ background: "linear-gradient(160deg, #1A0533 0%, #3B1A6B 50%, #6B35B8 100%)" }}>

        {/* Stars */}
        <div className="absolute inset-0 stars-bg pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,107,107,0.15), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,217,61,0.12), transparent)" }} />

        {/* Floating emojis */}
        {[
          { e: "⭐", cls: "top-28 left-8 text-3xl", delay: "0s" },
          { e: "🌙", cls: "top-40 right-16 text-4xl", delay: "1s" },
          { e: "✨", cls: "bottom-48 left-16 text-2xl", delay: "0.5s" },
          { e: "🪄", cls: "top-60 right-1/3 text-3xl", delay: "1.5s" },
          { e: "💫", cls: "bottom-32 right-20 text-3xl", delay: "0.8s" },
        ].map(({ e, cls, delay }) => (
          <span key={e} className={`absolute ${cls} animate-float select-none pointer-events-none`}
            style={{ animationDelay: delay }}>{e}</span>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left: text */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{ background: "rgba(255,217,61,0.15)", color: "#FFD93D", border: "1px solid rgba(255,217,61,0.3)" }}>
              ✨ Магически персонализирани приказки
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Приказка само
              <br />
              <span className="shimmer-text">за твоето дете</span>
            </h1>

            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Въведи името му и за секунди се ражда вълшебна история — с него като герой, уникални илюстрации и глас.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStart}
                className="group px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
                  color: "#3B1A6B",
                  boxShadow: "0 8px 32px rgba(255,107,107,0.4)",
                }}
              >
                🪄 Създай безплатно
              </button>
              <div className="flex items-center gap-3 px-4">
                <div className="flex -space-x-2">
                  {["👶", "🧒", "👦"].map((e) => (
                    <div key={e} className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2"
                      style={{ background: "rgba(107,53,184,0.6)", borderColor: "rgba(255,255,255,0.3)" }}>
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">1,200+ приказки</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>създадени тази седмица</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8">
              {[["🆓", "Безплатно"], ["🇧🇬", "На български"], ["⚡", "За 30 секунди"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: hero illustration */}
          <div className="relative flex items-center justify-center animate-scale-in">
            <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)" }}>
              {heroUrl ? (
                <Image src={heroUrl} alt="AuraKids магическа илюстрация" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                  style={{ background: "linear-gradient(135deg, #3B1A6B, #6B35B8)" }}>
                  <span className="text-7xl animate-float-slow">📖</span>
                  <div className="flex gap-2">
                    {["⭐", "✨", "🌙"].map((e, i) => (
                      <span key={e} className="text-2xl animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Floating badge over image */}
              <div className="absolute top-4 left-4 glass-dark rounded-2xl px-4 py-2.5">
                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Приказка за</div>
                <div className="text-base font-bold text-white">Александър ⭐</div>
              </div>
              <div className="absolute bottom-4 right-4 glass-dark rounded-2xl px-4 py-2.5 text-right">
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Тема</div>
                <div className="text-base font-bold text-white">🐉 Дракони</div>
              </div>
            </div>

            {/* Decorative ring */}
            <div className="absolute -inset-4 rounded-3xl border opacity-20 animate-spin-slow pointer-events-none"
              style={{ borderColor: "#FFD93D", borderStyle: "dashed" }} />
          </div>
        </div>
      </section>
    </>
  );
}

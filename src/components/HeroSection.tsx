"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AuraLogo from "./AuraLogo";

interface HeroSectionProps {
  onStart: () => void;
}

function Stars5() {
  return (
    <span className="stars-row">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="#FFD93D">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
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
    <section className="ak-screen home-hero-bg">
      <div className="stars" />
      <div className="glow" style={{ width: 240, height: 240, background: "rgba(255,107,107,0.18)", top: 120, right: -60 }} />
      <div className="glow" style={{ width: 200, height: 200, background: "rgba(155,111,232,0.25)", top: 420, left: -70 }} />

      <div className="ak-col">
        {/* Nav */}
        <div className="home-nav">
          <div className="brandrow">
            <AuraLogo size={34} />
            <span className="wm">AuraKids</span>
          </div>
          <button className="pillbtn" onClick={onStart}>Вход</button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 0 40px" }}>
          <span className="badge-chip" data-rise style={{ animationDelay: ".05s" }}>
            ✨ Над 1 200 създадени приказки
          </span>

          <h1 className="hero-h1" data-rise style={{ animationDelay: ".12s" }}>
            Само едно дете<br />е героят.<br />
            <span className="shimmer">Твоето.</span>
          </h1>

          <p className="hero-sub" data-rise style={{ animationDelay: ".2s" }}>
            Кажи ни името и любимия свят на детето — и за минута получаваш приказка,
            написана, илюстрирана и разказана само за него.
          </p>

          <div className="hero-illus" data-rise style={{ animationDelay: ".28s" }}>
            {heroUrl ? (
              <Image src={heroUrl} alt="AuraKids илюстрация" fill className="object-cover" unoptimized />
            ) : (
              <>
                <div className="stars" />
                <div className="glow animate-float-slow" style={{ width: 160, height: 160, background: "radial-gradient(circle, rgba(255,217,61,0.3), rgba(255,107,107,0.2), transparent)" }} />
                <AuraLogo size={72} />
              </>
            )}
            <div className="protect" />
            <div className="floatcap">
              <span className="badge-chip" style={{ background: "rgba(255,255,255,0.16)" }}>🌙 Лека нощ, герои</span>
            </div>
          </div>

          <button className="cta" data-rise style={{ animationDelay: ".34s" }} onClick={onStart}>
            Създай приказка
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          <div className="micro" data-rise style={{ animationDelay: ".4s" }}>
            <span>Безплатно</span><span className="dot">·</span>
            <span>Готово за около минута</span><span className="dot">·</span>
            <span>Запазена завинаги</span>
          </div>

          <div className="rating" data-rise style={{ animationDelay: ".46s" }}>
            <Stars5 />
            <span><strong style={{ color: "#fff" }}>4.9 / 5</strong> от 380+ родители</span>
          </div>
        </div>
      </div>
    </section>
  );
}

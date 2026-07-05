"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AuraLogo from "./AuraLogo";

interface HeroSectionProps {
  onStartStory: () => void;
  onStartComic: () => void;
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

const DOOR_PROMPTS = {
  story: "A cozy magical bedtime scene: a small child tucked in bed under a starry blanket, a warm glowing lamp, an open storybook with golden sparkles rising from its pages toward a crescent moon in the window, soft dreamy night atmosphere, rich purples and warm gold",
  comic: "A thrilled child superhero mid-leap over city rooftops at sunset, cape flying, dynamic action pose, comic book energy with motion lines and bright bold colors, joyful adventurous expression, cinematic wide angle",
};

function DoorImage({ kind }: { kind: "story" | "comic" }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: DOOR_PROMPTS[kind] }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setUrl(d.url))
      .catch(() => {});
  }, [kind]);

  return (
    <div className="door-img">
      {url && <Image src={url} alt="" fill className="object-cover" unoptimized />}
    </div>
  );
}

export default function HeroSection({ onStartStory, onStartComic }: HeroSectionProps) {

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
          <button className="pillbtn" onClick={onStartStory}>Вход</button>
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

          <div data-rise style={{ animationDelay: ".28s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 26 }}>
            <button className="app-door door-story" onClick={onStartStory}>
              <DoorImage kind="story" />
              <span className="door-title">Вечерна приказка</span>
              <span className="door-desc">За слушане преди сън — с илюстрации и глас</span>
              <span className="door-cta">Създай →</span>
            </button>
            <button className="app-door door-comic" onClick={onStartComic}>
              <DoorImage kind="comic" />
              <span className="door-title">Комикс студио</span>
              <span className="door-desc">Цели комикс страници с реплики и екшън</span>
              <span className="door-cta">Нарисувай →</span>
            </button>
          </div>

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

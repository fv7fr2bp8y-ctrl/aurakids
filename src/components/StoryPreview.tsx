"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Card {
  title: string;
  child: string;
  age: string;
  theme: string;
  excerpt: string;
  prompt: string;
  gradient: string;
  accentColor: string;
  icon: string;
}

const CARDS: Card[] = [
  {
    title: "Александър и Огненият Дракон",
    child: "Александър", age: "6 год.",
    theme: "Дракони",
    excerpt: "Тази нощ луната светеше по-ярко от всякога. И само Александър знаеше защо — огненият дракон беше събуден...",
    prompt: "Disney watercolor illustration, a brave young boy with big expressive brown eyes and a tiny golden crown, soaring through a magical twilight sky riding a friendly glowing purple dragon with iridescent scales, enchanted fantasy kingdom below with glowing towers, warm coral and gold watercolor washes, soft painterly brushstrokes, cinematic fairy-tale mood, ultra-detailed, no text, no watermarks",
    gradient: "linear-gradient(145deg, #1a0533 0%, #6B35B8 60%, #FF6B6B 100%)",
    accentColor: "#FF6B6B",
    icon: "🐉",
  },
  {
    title: "Ева и Говорещата Гора",
    child: "Ева", age: "5 год.",
    theme: "Вълшебна гора",
    excerpt: "Гората зад дома на Ева пазеше тайна — такава, която само тя можеше да открие. И точно тя я откри...",
    prompt: "Disney watercolor illustration, an adorable young girl with big curly auburn hair and rosy cheeks, sitting on a mossy root in an enchanted ancient forest, a wise owl perched beside her and a gentle fox at her feet, giant glowing mushrooms, soft firefly light, magical mist, lush emerald and gold watercolor washes, painterly soft brushstrokes, fairy-tale wonder, ultra-detailed, no text, no watermarks",
    gradient: "linear-gradient(145deg, #052015 0%, #166534 60%, #4ADE80 100%)",
    accentColor: "#4ADE80",
    icon: "🌿",
  },
  {
    title: "Никола — Пазителят на Звездите",
    child: "Никола", age: "7 год.",
    theme: "Космос",
    excerpt: "Когато всички звезди угаснаха, единственият, когото Вселената извика на помощ, беше Никола. Неустрашим...",
    prompt: "Disney watercolor illustration, a fearless young boy in a soft astronaut suit floating weightlessly in deep magical space, surrounded by friendly glowing planets with faces, swirling pink and violet nebulas, a trail of golden stardust, deep indigo and purple watercolor washes, painterly soft brushstrokes, sense of infinite wonder, ultra-detailed, no text, no watermarks",
    gradient: "linear-gradient(145deg, #020617 0%, #1e1b4b 60%, #7C3AED 100%)",
    accentColor: "#A78BFA",
    icon: "🚀",
  },
];

function StoryCard({ card, index }: { card: Card; index: number }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: card.prompt }),
      })
        .then((r) => r.json())
        .then((d) => d.url && setImgUrl(d.url))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, index * 800);
    return () => clearTimeout(t);
  }, [card.prompt, index]);

  return (
    <div className="group rounded-3xl overflow-hidden card-hover flex flex-col"
      style={{ boxShadow: `0 8px 48px ${card.accentColor}22, 0 2px 8px rgba(0,0,0,0.08)` }}>

      {/* Image area */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {imgUrl ? (
          <Image src={imgUrl} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: card.gradient }}>
            {/* Decorative stars */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute rounded-full animate-twinkle"
                style={{
                  width: Math.random() > 0.5 ? 2 : 3,
                  height: Math.random() > 0.5 ? 2 : 3,
                  background: "white",
                  opacity: 0.4 + Math.random() * 0.4,
                  top: `${10 + Math.random() * 80}%`,
                  left: `${5 + Math.random() * 90}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }} />
            ))}
            <div className="relative z-10 text-center flex flex-col items-center gap-3">
              <div className="text-6xl mb-1" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>
                {card.icon}
              </div>
              {loading && (
                <div className="flex gap-1.5">
                  {[0, 0.25, 0.5].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full animate-twinkle"
                      style={{ background: card.accentColor, animationDelay: `${d}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />

        {/* Theme chip */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: card.accentColor, boxShadow: `0 2px 10px ${card.accentColor}88` }}>
          {card.theme}
        </div>
      </div>

      {/* Text */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        <div className="text-xs font-semibold mb-2" style={{ color: card.accentColor }}>
          Приказка за {card.child}, {card.age}
        </div>
        <h3 className="font-bold text-base leading-snug mb-3" style={{ color: "#1A0533" }}>
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#6B5A8A", fontStyle: "italic", flexGrow: 1 }}>
          &ldquo;{card.excerpt}&rdquo;
        </p>
      </div>
    </div>
  );
}

export default function StoryPreview({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #F5EEFF 0%, #EDE0FF 100%)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#9B6FE8" }}>
            Примерни приказки
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: "#1A0533" }}>
            Никое друго дете
            <br />
            <span style={{ color: "#6B35B8" }}>не е получавало тази история</span>
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: "#6B5A8A", lineHeight: 1.7 }}>
            Не шаблон. Не готова приказка. Нова история, написана в момента — само за вашето дете.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {CARDS.map((card, i) => <StoryCard key={card.title} card={card} index={i} />)}
        </div>

        <div className="text-center">
          <button onClick={onStart}
            className="px-12 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 inline-flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #6B35B8, #FF6B6B)", boxShadow: "0 16px 48px rgba(107,53,184,0.4)" }}>
            Напиши приказката на моето дете
          </button>
          <p className="text-sm mt-4" style={{ color: "#9B8FC0" }}>
            Безплатно · Готово за около минута · Запазена завинаги
          </p>
        </div>
      </div>
    </section>
  );
}

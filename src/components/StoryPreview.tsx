"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PreviewCard {
  title: string;
  child: string;
  age: string;
  theme: string;
  color: string;
  excerpt: string;
  prompt: string;
}

const PREVIEWS: PreviewCard[] = [
  {
    title: "Александър и Огненият Дракон",
    child: "Александър",
    age: "6 години",
    theme: "Дракони",
    color: "#FF6B6B",
    excerpt: "Тази нощ луната светеше по-ярко от всякога над Пурпурните планини. И само Александър знаеше защо — огненият дракон беше събуден...",
    prompt: "A brave little Bulgarian boy named Alexander with big brown eyes wearing a small golden crown, riding a magnificent friendly purple dragon with iridescent scales over a magical fantasy kingdom at sunset, 3D Pixar animation style, ultra-detailed, cinematic lighting, rich jewel-tone colors, no text",
  },
  {
    title: "Ева и Говорещата Гора",
    child: "Ева",
    age: "5 години",
    theme: "Вълшебна гора",
    color: "#4ADE80",
    excerpt: "Гората зад дома на Ева пазеше тайна — такава, която само едно дете на петте й години можеше да открие. И точно тя я откри...",
    prompt: "An adorable little Bulgarian girl named Eva with curly hair and rosy cheeks, talking to wise friendly woodland animals including an owl, a fox, and a deer in an enchanted glowing forest with giant mushrooms and fireflies, 3D Pixar animation style, soft magical lighting, pastel greens and pinks, no text",
  },
  {
    title: "Никола — Пазителят на Звездите",
    child: "Никола",
    age: "7 години",
    theme: "Космос",
    color: "#9B6FE8",
    excerpt: "Когато всички звезди угаснаха в една нощ, единственият, когото Вселената извика на помощ, беше Никола. Седемгодишен. Неустрашим...",
    prompt: "A cute little Bulgarian boy astronaut named Nikola floating weightlessly in vibrant colorful space, surrounded by friendly smiling planets Saturn and Jupiter, glowing nebulas, and a trail of golden stars, 3D Pixar animation quality, ultra-detailed, deep purple and gold color palette, no text",
  },
];

function StoryCard({ card, index }: { card: PreviewCard; index: number }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: card.prompt }),
      })
        .then((r) => r.json())
        .then((d) => d.url && setImgUrl(d.url))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, index * 200);
    return () => clearTimeout(timer);
  }, [card.prompt, index]);

  return (
    <div className="rounded-3xl overflow-hidden card-hover flex flex-col"
      style={{
        background: "#fff",
        boxShadow: "0 8px 40px rgba(59,26,107,0.10)",
        border: "1px solid rgba(59,26,107,0.06)",
      }}>

      {/* Illustration */}
      <div className="relative h-52 w-full flex-shrink-0">
        {imgUrl ? (
          <Image src={imgUrl} alt={card.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3"
            style={{ background: `linear-gradient(135deg, ${card.color}22, ${card.color}44)` }}>
            {loading ? (
              <>
                <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke={card.color} strokeWidth="3" />
                  <path className="opacity-80" fill={card.color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs font-medium" style={{ color: card.color }}>Зарежда илюстрация...</span>
              </>
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${card.color}33` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={card.color} />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Theme badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
          style={{ background: card.color, boxShadow: `0 2px 8px ${card.color}66` }}>
          {card.theme}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base leading-snug mb-1.5" style={{ color: "#1A0533" }}>
          {card.title}
        </h3>
        <p className="text-xs mb-3" style={{ color: "#9B8FC0" }}>
          Създадена за {card.child}, {card.age}
        </p>
        <p className="text-sm leading-relaxed flex-1" style={{ color: "#5B4F7A", fontStyle: "italic" }}>
          &ldquo;{card.excerpt}&rdquo;
        </p>
      </div>
    </div>
  );
}

interface StoryPreviewProps {
  onStart: () => void;
}

export default function StoryPreview({ onStart }: StoryPreviewProps) {
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
            Не шаблон. Не предварително написана приказка. Нова история, създадена в момента — само за вашето дете, само с неговото име.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PREVIEWS.map((card, i) => (
            <StoryCard key={card.title} card={card} index={i} />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onStart}
            className="px-12 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 inline-flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #6B35B8, #FF6B6B)",
              boxShadow: "0 16px 48px rgba(107,53,184,0.40)",
            }}
          >
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

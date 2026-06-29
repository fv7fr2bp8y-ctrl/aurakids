"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PreviewCard {
  title: string;
  child: string;
  theme: string;
  emoji: string;
  color: string;
  prompt: string;
}

const PREVIEWS: PreviewCard[] = [
  { title: "Александър и Огненият Дракон", child: "Александър, 6г.", theme: "Дракони", emoji: "🐉", color: "#FF6B6B", prompt: "A brave little boy named Alexander riding a friendly orange dragon over a magical castle at sunset, children's book watercolor illustration, warm colors, Pixar style" },
  { title: "Ева и Тайната Гора", child: "Ева, 5г.", theme: "Вълшебна гора", emoji: "🌳", color: "#4FC3F7", prompt: "A cute girl named Eva talking to wise talking animals in an enchanted forest with glowing mushrooms and fireflies, children's book illustration, soft pastel watercolor" },
  { title: "Никола — Пазителят на Звездите", child: "Никола, 7г.", theme: "Космос", emoji: "🚀", color: "#9B6FE8", prompt: "A little astronaut boy named Nikola floating in colorful space surrounded by friendly planets and stars, children's book watercolor illustration, dreamy purple night sky" },
];

function PreviewCard({ card }: { card: PreviewCard }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: card.prompt }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setImgUrl(d.url))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [card.prompt]);

  return (
    <div className="rounded-3xl overflow-hidden card-hover" style={{ background: "#fff", boxShadow: "0 8px 32px rgba(59,26,107,0.12)" }}>
      {/* Image */}
      <div className="relative h-44 w-full">
        {imgUrl ? (
          <Image src={imgUrl} alt={card.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${card.color}33, ${card.color}66)` }}>
            {loading ? (
              <svg className="animate-spin w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke={card.color} strokeWidth="4" />
                <path className="opacity-75" fill={card.color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="text-5xl animate-float">{card.emoji}</span>
            )}
          </div>
        )}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: card.color, color: "#fff" }}>
          {card.emoji} {card.theme}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm leading-snug mb-1" style={{ color: "#3B1A6B" }}>{card.title}</h3>
        <p className="text-xs" style={{ color: "#9B8FC0" }}>✨ Създадена за {card.child}</p>
      </div>
    </div>
  );
}

interface StoryPreviewProps {
  onStart: () => void;
}

export default function StoryPreview({ onStart }: StoryPreviewProps) {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-medium"
            style={{ background: "rgba(107,53,184,0.1)", color: "#6B35B8" }}>
            📖 Примерни приказки
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#3B1A6B" }}>
            Всяка приказка е уникална
          </h2>
          <p className="text-lg" style={{ color: "#7B6FA0" }}>
            Вижте как реални деца станаха герои в собствената си история
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PREVIEWS.map((card) => (
            <PreviewCard key={card.title} card={card} />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onStart}
            className="px-10 py-4 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6B35B8, #FF6B6B)",
              boxShadow: "0 12px 32px rgba(107,53,184,0.35)",
            }}
          >
            🪄 Създай приказката на твоето дете
          </button>
        </div>
      </div>
    </section>
  );
}

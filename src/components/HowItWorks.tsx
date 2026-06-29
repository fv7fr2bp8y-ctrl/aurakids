"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STEPS = [
  {
    title: "Въведи името",
    desc: "Напиши името на детето и избери тема на приказката.",
    color: "#FF6B6B",
    prompt: "A child's name written in golden magical sparkles and stars floating in the air, children's book watercolor illustration, soft purple background, warm glowing light, no text",
  },
  {
    title: "AI създава",
    desc: "Уникална персонализирана приказка се ражда за секунди.",
    color: "#FFD93D",
    prompt: "A magical glowing book opening with light streaming out, words and stories appearing from the pages, watercolor children's book illustration, warm golden tones, enchanting",
  },
  {
    title: "Илюстрации оживяват",
    desc: "Всяка сцена получава красива AI илюстрация.",
    color: "#9B6FE8",
    prompt: "A magical paintbrush painting a colorful children's book illustration by itself, vivid watercolor art coming to life on paper, pastel colors, dreamy and creative",
  },
  {
    title: "Чуй на глас",
    desc: "Естествен глас разказва приказката на детето.",
    color: "#4FC3F7",
    prompt: "Soft colorful sound waves flowing from a glowing speaker, musical notes and stars floating in the air, children's book watercolor style, soft blue and purple tones",
  },
];

function StepImage({ prompt, color }: { prompt: string; color: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setUrl(d.url))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [prompt]);

  return (
    <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-5"
      style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
      {url ? (
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      ) : loading ? (
        <div className="h-full flex items-center justify-center">
          <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
            <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="h-full" style={{ background: `linear-gradient(135deg, ${color}33, ${color}55)` }} />
      )}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "#FFF8F0" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-medium"
            style={{ background: "rgba(107,53,184,0.1)", color: "#6B35B8" }}>
            Само 4 стъпки
          </div>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#3B1A6B" }}>
            Как работи?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-3xl p-5 card-hover"
              style={{ background: "#fff", border: "2px solid", borderColor: `${s.color}25`, boxShadow: `0 8px 24px ${s.color}12` }}>
              <div className="absolute -top-4 left-5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: s.color }}>
                {i + 1}
              </div>
              <StepImage prompt={s.prompt} color={s.color} />
              <h3 className="font-bold mb-1 text-sm" style={{ color: "#3B1A6B" }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

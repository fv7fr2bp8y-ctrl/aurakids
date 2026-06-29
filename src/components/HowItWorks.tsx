"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STEPS = [
  {
    n: "1",
    title: "Назови героя",
    desc: "Въведи името на детето и на колко години е.",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    glow: "rgba(255,107,107,0.30)",
    prompt: "Disney watercolor illustration, a happy child with big expressive eyes holding a glowing golden quill pen, writing their name in sparkling magical letters that float in the air, soft warm light, enchanting fairy-tale mood, pastel peach and gold tones, no text, no letters, no watermarks",
  },
  {
    n: "2",
    title: "Избери свят",
    desc: "Дракони, космос, вълшебна гора — или измисли свой.",
    gradient: "linear-gradient(135deg, #FFD93D 0%, #FF9A3C 100%)",
    glow: "rgba(255,217,61,0.30)",
    prompt: "Disney watercolor illustration, a magical glowing portal showing four tiny worlds: a dragon castle, a starry space scene, an enchanted forest, an underwater kingdom, swirling magical energy connecting them, vibrant jewel tones, wonder and adventure mood, no text, no letters, no watermarks",
  },
  {
    n: "3",
    title: "Приказката се ражда",
    desc: "AI пише история само за вашето дете с уникални илюстрации.",
    gradient: "linear-gradient(135deg, #9B6FE8 0%, #6B35B8 100%)",
    glow: "rgba(155,111,232,0.30)",
    prompt: "Disney watercolor illustration, a magnificent open storybook floating in mid-air, glowing characters and scenes rising from its pages as magical smoke and sparkling stars, deep purple and gold magical atmosphere, cinematic fairy-tale mood, no text, no letters, no watermarks",
  },
  {
    n: "4",
    title: "Чуй я на глас",
    desc: "Топъл глас разказва приказката. Пазена е завинаги.",
    gradient: "linear-gradient(135deg, #4FC3F7 0%, #0284C7 100%)",
    glow: "rgba(79,195,247,0.30)",
    prompt: "Disney watercolor illustration, a parent and child snuggled together in cozy warm blankets at night, soft golden lamp light, magical glowing sound waves floating around them like ribbons of light, stars visible through window, tender heartwarming mood, blue and gold tones, no text, no letters, no watermarks",
  },
];

function StepImage({ prompt, gradient }: { prompt: string; gradient: string }) {
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
    <div className="relative h-44 w-full overflow-hidden">
      {url ? (
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      ) : (
        <div className="h-full w-full flex items-center justify-center" style={{ background: gradient }}>
          {loading && (
            <svg className="animate-spin w-7 h-7 text-white/60" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      )}
      {/* Gradient overlay fading into white at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12"
        style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 60%, #FFF8F0 100%)" }}>
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9B6FE8" }}>
            Как работи
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#1A0533" }}>
            Четири стъпки до<br />
            <span style={{ color: "#6B35B8" }}>вечер, която не се забравя</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative group">
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3 top-20 z-20 text-2xl font-light select-none"
                  style={{ color: "#C4B5FD" }}>›</div>
              )}
              <div className="h-full rounded-3xl overflow-hidden bg-white transition-transform duration-300 group-hover:-translate-y-1"
                style={{ boxShadow: `0 8px 32px ${s.glow}, 0 0 0 1px rgba(0,0,0,0.04)` }}>

                <StepImage prompt={s.prompt} gradient={s.gradient} />

                <div className="px-5 pt-2 pb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: s.glow, color: "#1A0533" }}>
                      {s.n}
                    </span>
                    <h3 className="text-sm font-bold" style={{ color: "#1A0533" }}>{s.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#7B6FA0" }}>{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

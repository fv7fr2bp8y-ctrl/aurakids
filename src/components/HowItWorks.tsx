"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STEPS = [
  {
    n: "1",
    title: "Назови героя",
    desc: "Въведи името на детето и на колко години е.",
    bg: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    prompt: "Disney watercolor illustration, close-up of a small magical journal open on a wooden table, a golden feather quill writing a child's name in glowing cursive script, tiny sparkling stars floating around the letters, warm candlelight atmosphere, rich amber and gold tones, painterly soft brushstrokes, no text, no letters, no watermarks",
  },
  {
    n: "2",
    title: "Избери свят",
    desc: "Дракони, космос, вълшебна гора — или измисли свой.",
    bg: "linear-gradient(135deg, #FFD93D 0%, #FF9A3C 100%)",
    prompt: "Disney watercolor illustration, a breathtaking magical landscape split into four enchanting worlds: a moonlit dragon castle on a mountain, a vibrant purple nebula with planets, an ancient glowing forest with fireflies, a shimmering underwater coral palace, all connected by swirling ribbons of golden light, ultra-detailed, no text, no letters, no watermarks",
  },
  {
    n: "3",
    title: "Приказката се ражда",
    desc: "AI пише история само за вашето дете с уникални илюстрации.",
    bg: "linear-gradient(135deg, #A78BFA 0%, #6B35B8 100%)",
    prompt: "Disney watercolor illustration, a giant glowing storybook floating in a starry night sky, its pages bursting open with magical light, a tiny brave child hero emerging from the book surrounded by golden sparkles and swirling purple magic, cinematic composition, deep violet and gold color palette, ultra-detailed, no text, no letters, no watermarks",
  },
  {
    n: "4",
    title: "Чуй я на глас",
    desc: "Топъл глас разказва приказката. После я намираш в библиотеката.",
    bg: "linear-gradient(135deg, #67E8F9 0%, #2563EB 100%)",
    prompt: "Disney watercolor illustration, a cozy bedroom at night, a parent and young child snuggled under a starry blanket together, soft golden lamplight, magical glowing ribbons of sound floating through the air like aurora borealis, a crescent moon visible through the window, tender intimate mood, warm blue and gold tones, ultra-detailed, no text, no letters, no watermarks",
  },
];

function StepImage({ prompt, bg, n }: { prompt: string; bg: string; n: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const delay = (parseInt(n) - 1) * 400;
    const t = setTimeout(() => {
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.url) { setUrl(d.url); setStatus("done"); }
          else setStatus("error");
        })
        .catch(() => setStatus("error"));
    }, delay);
    return () => clearTimeout(t);
  }, [prompt, n]);

  return (
    <div className="relative h-48 w-full overflow-hidden">
      {url ? (
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: bg }}>
          {status === "loading" && (
            <svg className="animate-spin w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, white)" }} />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-20 px-6" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #F0E6FF 60%, #FFF8F0 100%)" }}>
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
                <div className="hidden lg:block absolute -right-3.5 top-20 z-20 text-2xl select-none"
                  style={{ color: "#C4B5FD" }}>›</div>
              )}
              <div className="h-full rounded-3xl overflow-hidden bg-white transition-transform duration-300 group-hover:-translate-y-1"
                style={{ boxShadow: "0 8px 32px rgba(107,53,184,0.12), 0 0 0 1px rgba(0,0,0,0.04)" }}>

                <div className="relative">
                  <StepImage prompt={s.prompt} bg={s.bg} n={s.n} />
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10"
                    style={{ background: "rgba(0,0,0,0.28)", color: "white", backdropFilter: "blur(6px)" }}>
                    {s.n}
                  </div>
                </div>

                <div className="px-5 pt-1 pb-5">
                  <h3 className="text-sm font-bold mb-1" style={{ color: "#1A0533" }}>{s.title}</h3>
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

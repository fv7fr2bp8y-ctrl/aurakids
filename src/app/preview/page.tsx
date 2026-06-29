"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImgSlot {
  id: string;
  label: string;
  prompt: string;
  url?: string;
  loading: boolean;
  error?: string;
}

const VARIANTS: Omit<ImgSlot, "url" | "loading">[] = [
  // Hero options
  {
    id: "hero-a",
    label: "Hero A — Дете + дракон, нощно небе",
    prompt:
      "A breathtaking 3D Pixar-style illustration: an adorable 6-year-old child with big expressive eyes and rosy cheeks, wearing a tiny golden crown, riding a majestic friendly glowing purple dragon through a magical night sky. The dragon has soft iridescent scales, kind eyes, and golden-tipped wings. Below them a dreamy fantasy kingdom with glowing castle towers and thousands of twinkling stars. Rich jewel-tone colors — deep purple, coral pink, golden yellow. Ultra-detailed 3D render, cinematic lighting, wide landscape format, no text, no watermark.",
  },
  {
    id: "hero-b",
    label: "Hero B — Дете с книга, магически свят",
    prompt:
      "A stunning 3D Pixar animation style illustration: a cute child with big brown eyes sitting on a giant magical open book that floats among clouds and stars. From the pages of the book burst colorful fantasy worlds — dragons, castles, mermaids, rockets. Warm golden light pours from the book. Deep purple night sky with aurora borealis in background. Ultra-detailed, cinematic quality, jewel-tone colors, wide landscape, no text.",
  },
  {
    id: "hero-c",
    label: "Hero C — Вълшебна библиотека",
    prompt:
      "A magical 3D Pixar-style illustration of a cozy enchanted library at night: towering bookshelves that spiral upward infinitely, glowing books floating open in the air, a small child in pyjamas sitting on a flying carpet reading, stars visible through a domed glass ceiling, fireflies and golden sparks everywhere. Warm amber and deep purple color palette, ultra-detailed, cinematic, no text.",
  },
  {
    id: "hero-d",
    label: "Hero D — Дете герой в замък",
    prompt:
      "Epic 3D Pixar animation style: a brave little child hero standing at the entrance of a magnificent glowing magical castle at sunset, wearing a small cape, holding a glowing magic wand. The castle towers reach the clouds. A friendly dragon perches on a tower. Warm golden-hour lighting, purple sky with stars appearing, ultra-detailed render, rich saturated colors, wide cinematic landscape, no text.",
  },

  // Story card illustrations
  {
    id: "story-dragon",
    label: "Илюстрация — Дракони",
    prompt:
      "A brave little Bulgarian boy with big brown eyes and a small golden crown, riding a magnificent friendly purple dragon with iridescent scales over a magical glowing fantasy kingdom at golden hour. The boy looks joyful and fearless. 3D Pixar animation quality, ultra-detailed, cinematic lighting, rich jewel-tone purple and gold colors, portrait orientation, no text.",
  },
  {
    id: "story-forest",
    label: "Илюстрация — Вълшебна гора",
    prompt:
      "An adorable little girl with curly hair and rosy cheeks, sitting in a magical enchanted forest talking to a wise owl, a friendly fox, and a gentle deer. Giant glowing mushrooms surround them, fireflies create a magical atmosphere, soft ethereal light filters through ancient trees. 3D Pixar animation quality, soft pastel greens and pinks, ultra-detailed, dreamy atmosphere, no text.",
  },
  {
    id: "story-space",
    label: "Илюстрация — Космос",
    prompt:
      "A cute little boy astronaut floating weightlessly in vibrant colorful space, surrounded by friendly smiling planets with faces — Saturn with its rings, Jupiter with its storms — glowing nebulas in pink and purple, a trail of golden stars leading the way. His space suit has his name on it. 3D Pixar quality, deep purple and gold palette, ultra-detailed, magical atmosphere, no text.",
  },
  {
    id: "story-mermaid",
    label: "Илюстрация — Подводен свят",
    prompt:
      "A joyful little girl swimming underwater in a breathtaking magical ocean kingdom, surrounded by colorful tropical fish, friendly sea turtles, and playful dolphins. Coral castles glow in the background, treasure chests gleam on the seafloor, beams of sunlight filter down from above. 3D Pixar animation quality, vibrant ocean blues and teals, ultra-detailed, no text.",
  },
  {
    id: "story-fairy",
    label: "Илюстрация — Феи и магия",
    prompt:
      "A delighted little girl flying through a magical twilight garden holding hands with a tiny glowing fairy, both leaving trails of golden sparkles. Giant flowers tower above them, mushroom houses glow softly, hundreds of fireflies create a magical constellation. 3D Pixar animation quality, soft pinks, purples and golds, ultra-detailed, enchanting atmosphere, no text.",
  },
  {
    id: "story-superhero",
    label: "Илюстрация — Супергерой",
    prompt:
      "An adorable little boy in a colorful superhero costume flying above a vibrant city at sunset, cape billowing in the wind, big confident smile, one fist raised heroically. The city below sparkles with lights, clouds part around him, golden sunset light illuminates him from behind. 3D Pixar animation quality, bold primary colors, ultra-detailed, cinematic, no text.",
  },
];

function ImageCard({ slot }: { slot: ImgSlot }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className="relative w-full" style={{ aspectRatio: slot.id.startsWith("hero") ? "16/9" : "3/4" }}>
        {slot.loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, #2D0F55, #6B35B8)" }}>
            <svg className="animate-spin w-8 h-8 opacity-60" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#FFD93D" strokeWidth="3" />
              <path className="opacity-75" fill="#FFD93D" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-white/40 text-xs">Генерира...</span>
          </div>
        ) : slot.error ? (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(255,0,0,0.1)" }}>
            <span className="text-red-400 text-xs text-center px-4">{slot.error}</span>
          </div>
        ) : slot.url ? (
          <Image src={slot.url} alt={slot.label} fill className="object-cover" unoptimized />
        ) : null}
      </div>
      <div className="px-4 py-3">
        <p className="text-white/70 text-xs font-medium">{slot.label}</p>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const [slots, setSlots] = useState<ImgSlot[]>(
    VARIANTS.map((v) => ({ ...v, loading: true }))
  );

  useEffect(() => {
    slots.forEach((slot, idx) => {
      // Stagger requests to avoid rate limits
      setTimeout(async () => {
        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: slot.prompt }),
          });
          const data = await res.json();
          setSlots((prev) =>
            prev.map((s) =>
              s.id === slot.id
                ? { ...s, url: data.url ?? undefined, loading: false, error: data.error ?? (!data.url ? "Грешка при генериране" : undefined) }
                : s
            )
          );
        } catch {
          setSlots((prev) =>
            prev.map((s) =>
              s.id === slot.id ? { ...s, loading: false, error: "Мрежова грешка" } : s
            )
          );
        }
      }, idx * 3000); // 3 seconds between each to avoid rate limits
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroSlots = slots.filter((s) => s.id.startsWith("hero"));
  const storySlots = slots.filter((s) => s.id.startsWith("story"));

  return (
    <div className="min-h-screen p-8" style={{ background: "#0F0520" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Преглед на илюстрации</h1>
          <p className="text-white/40 text-sm">Картинките се генерират с DALL-E 3. Изберете кои ви харесват — ще ги сложим на сайта.</p>
          <p className="text-yellow-400/60 text-xs mt-1">Генерирането отнема ~25 сек за всяка. Изчакайте ги всички.</p>
        </div>

        <section className="mb-14">
          <h2 className="text-lg font-semibold text-white/70 mb-6 uppercase tracking-widest text-sm">Hero секция — 4 варианта</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroSlots.map((s) => <ImageCard key={s.id} slot={s} />)}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white/70 mb-6 uppercase tracking-widest text-sm">История илюстрации — 6 варианта</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {storySlots.map((s) => <ImageCard key={s.id} slot={s} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StoryData } from "./StoryGenerator";
import { useTTS } from "@/hooks/useTTS";
import AuraLogo from "./AuraLogo";

interface StoryDisplayProps {
  story: StoryData;
  onBack: () => void;
  onHome: () => void;
}

const PLACEHOLDERS = [
  { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", emoji: "🌟" },
  { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", emoji: "✨" },
  { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", emoji: "🌙" },
];

const CAPTIONS = [
  (name: string) => `${name} в началото на приключението`,
  () => "Вълшебният момент",
  () => "Щастливият край",
];

function useIllustration(prompt: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prompt) return;
    setLoading(true);
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

  return { url, loading };
}

export default function StoryDisplay({ story, onBack, onHome }: StoryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { speak, status: ttsStatus } = useTTS();
  const fullStoryText = `${story.title}.\n\n${story.story}`;

  const paragraphs = story.story
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${story.title}\n\n${story.story}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #faf7f2 0%, #f0e6ff 30%, #faf7f2 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-purple-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">

          {/* Back */}
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium shrink-0 transition-opacity hover:opacity-70"
            style={{ color: "#7c3aed" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Назад
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: "#7c3aed" }}>
            <AuraLogo size={22} />
            AuraKids
          </div>

          {/* Actions — icons only */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => speak(fullStoryText)} disabled={ttsStatus === "loading"}
              title="Чуй" aria-label="Чуй"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
              {ttsStatus === "loading" ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : ttsStatus === "playing" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1.5"/>
                  <rect x="9" y="2" width="4" height="12" rx="1.5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 5h2l4-3v12l-4-3H3a1 1 0 01-1-1V6a1 1 0 011-1zm8.5 1a3.5 3.5 0 010 4"/>
                </svg>
              )}
            </button>

            <button onClick={handleCopy} title="Копирай" aria-label="Копирай"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.1)", color: copied ? "#16a34a" : "#7c3aed" }}>
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <path d="M12 3L6 10 3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="1" width="9" height="11" rx="1.5"/>
                  <path d="M3 4H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-1"/>
                </svg>
              )}
            </button>

            <button onClick={() => window.print()} title="Печат" aria-label="Печат"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 5V2h7v3"/>
                <rect x="1" y="5" width="13" height="7" rx="1"/>
                <path d="M4 9h7M4 12h4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
            style={{ background: "rgba(168,85,247,0.1)", color: "#7c3aed" }}>
            <span>✨</span>
            <span>Приказка специално за {story.childName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: "#1a1a2e" }}>
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xl">{story.theme.split(" ")[0]}</span>
            <span className="text-sm" style={{ color: "#8080a0" }}>
              Тема: {story.theme.substring(story.theme.indexOf(" ") + 1)}
            </span>
          </div>
        </div>

        {/* Illustration 1 */}
        <IllustrationCard
          prompt={story.imagePrompts?.[0]}
          placeholder={PLACEHOLDERS[0]}
          caption={CAPTIONS[0](story.childName)}
        />

        {/* First half */}
        <div className="glass rounded-3xl p-8 mb-8 story-prose" style={{ color: "#2a2a4a" }}>
          {paragraphs.slice(0, Math.ceil(paragraphs.length / 2)).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Illustration 2 */}
        <IllustrationCard
          prompt={story.imagePrompts?.[1]}
          placeholder={PLACEHOLDERS[1]}
          caption={CAPTIONS[1](story.childName)}
        />

        {/* Second half */}
        <div className="glass rounded-3xl p-8 mb-8 story-prose" style={{ color: "#2a2a4a" }}>
          {paragraphs.slice(Math.ceil(paragraphs.length / 2)).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Illustration 3 */}
        <IllustrationCard
          prompt={story.imagePrompts?.[2]}
          placeholder={PLACEHOLDERS[2]}
          caption={CAPTIONS[2](story.childName)}
        />

        {/* End card */}
        <div className="text-center mt-12 p-8 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(168,85,247,0.15)" }}>
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: "#1a1a2e" }}>Край на приказката</h3>
          <p className="text-sm mb-6" style={{ color: "#8080a0" }}>
            Тази история бе създадена специално за {story.childName} · AuraKids
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl font-semibold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              🪄 Създай нова приказка
            </button>
            <button
              onClick={onHome}
              className="px-6 py-3 rounded-2xl font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}
            >
              🏠 Начало
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IllustrationCard({
  prompt,
  placeholder,
  caption,
}: {
  prompt?: string;
  placeholder: { bg: string; emoji: string };
  caption: string;
}) {
  const { url, loading } = useIllustration(prompt);

  return (
    <div className="mb-8 rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(168,85,247,0.15)" }}>
      <div className="relative h-64 w-full">
        {url ? (
          <Image src={url} alt={caption} fill className="object-cover" unoptimized />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3" style={{ background: placeholder.bg }}>
            {loading ? (
              <>
                <svg className="animate-spin w-8 h-8 text-white/70" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-white/70 text-sm">Рисувам илюстрацията...</span>
              </>
            ) : (
              <span className="text-6xl animate-float">{placeholder.emoji}</span>
            )}
          </div>
        )}
      </div>
      <div className="px-6 py-3 glass">
        <p className="text-sm text-center italic" style={{ color: "#8080a0" }}>🎨 {caption}</p>
      </div>
    </div>
  );
}

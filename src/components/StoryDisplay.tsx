"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StoryData } from "./StoryGenerator";
import { useTTS } from "@/hooks/useTTS";

interface StoryDisplayProps {
  story: StoryData;
  onBack: () => void;
  onHome: () => void;
}

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
  const { speak, status: ttsStatus } = useTTS();
  const fullStoryText = `${story.title}.\n\n${story.story}`;
  const { url: heroUrl, loading: heroLoading } = useIllustration(story.imagePrompts?.[0]);

  const paragraphs = story.story
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    navigator.clipboard.writeText(`${story.title}\n\n${story.story}`).catch(() => {});
  };

  return (
    <div className="reader-screen">
      {/* Illustration header */}
      <div className="reader-illus">
        {heroUrl ? (
          <Image src={heroUrl} alt={story.title} fill className="object-cover" unoptimized style={{ zIndex: 1 }} />
        ) : (
          <>
            <div className="stars" />
            {heroLoading && (
              <svg className="animate-spin-ak" width="34" height="34" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.7)", zIndex: 1 }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </>
        )}

        <div className="reader-topbar">
          <button className="iconbtn" onClick={onHome} title="Начало">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="iconbtn" onClick={handleCopy} title="Копирай">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="iconbtn" onClick={handlePrint} title="Печат">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="protect" />
      </div>

      {/* Content */}
      <div className="reader-content">
        <span className="chapter-tag">Приказка за {story.childName}</span>
        <h1 className="chapter-title">{story.title}</h1>
        <div className="prose">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "drop" : undefined}>{p}</p>
          ))}
        </div>

        <div className="endcard">
          <div className="ee">🌟</div>
          <h4>Край на приказката</h4>
          <p>Сладки сънища, малки герою. Тази история бе създадена само за {story.childName}.</p>
          <button className="cta" onClick={onBack}>🪄 Създай нова приказка</button>
        </div>
      </div>

      {/* Sticky audio player */}
      <div className="player">
        <div className="player-inner">
          <div className="player-row">
            <button className="playbtn" onClick={() => speak(fullStoryText)} disabled={ttsStatus === "loading"}>
              {ttsStatus === "loading" ? (
                <svg className="animate-spin-ak" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : ttsStatus === "playing" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <div className="player-meta">
              <div className="ptitle">Чете Аура</div>
              <div className="ptime">{ttsStatus === "playing" ? "Възпроизвежда…" : "Натисни, за да чуеш приказката"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

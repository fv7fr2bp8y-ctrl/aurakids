"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface ComicPanel {
  imagePrompt: string;
  speech?: string;
  speaker?: string;
  caption?: string;
}

export interface ComicData {
  childName: string;
  title: string;
  panels: ComicPanel[];
}

interface ComicDisplayProps {
  comic: ComicData;
  onBack: () => void;
  onHome: () => void;
}

function PanelImage({ prompt, index }: { prompt: string; index: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
        .then((r) => r.json())
        .then((d) => d.url && setUrl(d.url))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, index * 700);
    return () => clearTimeout(t);
  }, [prompt, index]);

  return (
    <div className="panel-img">
      <span className="panel-num">{index + 1}</span>
      {url ? (
        <Image src={url} alt={`Панел ${index + 1}`} fill className="object-cover" unoptimized />
      ) : loading ? (
        <svg className="animate-spin-ak" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.7)" }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <div className="stars" />
      )}
    </div>
  );
}

export default function ComicDisplay({ comic, onBack, onHome }: ComicDisplayProps) {
  return (
    <div className="comic-screen">
      {/* Header */}
      <div className="ak-col" style={{ maxWidth: 760 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 4px" }}>
          <button className="iconbtn" onClick={onHome} title="Начало"
            style={{ borderColor: "rgba(107,53,184,0.25)", background: "rgba(107,53,184,0.08)", color: "var(--ak-purple-mid)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="iconbtn" onClick={() => window.print()} title="Печат"
            style={{ borderColor: "rgba(107,53,184,0.25)", background: "rgba(107,53,184,0.08)", color: "var(--ak-purple-mid)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
            </svg>
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "10px 0 22px" }}>
          <span className="chapter-tag">Комикс за {comic.childName}</span>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "var(--ak-purple-night)", lineHeight: 1.15, marginTop: 8, letterSpacing: "-0.02em" }}>
            {comic.title}
          </h1>
        </div>
      </div>

      {/* Panels */}
      <div className="comic-grid">
        {comic.panels.map((p, i) => (
          <div key={i} className="panel">
            <PanelImage prompt={p.imagePrompt} index={i} />
            {p.speech ? (
              <div className="bubble">
                {p.speaker && <span className="who">{p.speaker}</span>}
                {p.speech}
              </div>
            ) : p.caption ? (
              <div className="caption-box">{p.caption}</div>
            ) : null}
          </div>
        ))}
      </div>

      {/* End */}
      <div className="ak-col" style={{ paddingBottom: 48 }}>
        <div className="endcard" style={{ display: "block" }}>
          <div className="ee">💥</div>
          <h4>Край!</h4>
          <p>Този комикс бе нарисуван само за {comic.childName}.</p>
          <button className="cta" onClick={onBack}>🎨 Нов комикс</button>
        </div>
      </div>
    </div>
  );
}

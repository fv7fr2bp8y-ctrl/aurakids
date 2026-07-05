"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { t } from "@/lib/i18n";

export interface ComicPage {
  url: string;
  text: string;
  pageTitle: string;
}

export interface ComicData {
  childName: string;
  title: string;
  pages: ComicPage[];
}

interface ComicDisplayProps {
  comic: ComicData;
  lang?: string;
  onBack: () => void;
  onHome: () => void;
}

export default function ComicDisplay({ comic, lang: langProp, onBack, onHome }: ComicDisplayProps) {
  const lang = langProp || "bg";
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    children.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
  };

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

        <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
          <span className="chapter-tag">{t(lang, "comicFor")} {comic.childName}</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--ak-purple-night)", lineHeight: 1.15, marginTop: 8, letterSpacing: "-0.02em" }}>
            {comic.title}
          </h1>
        </div>
      </div>

      {/* Full pages — swipe right through them */}
      <div className="comic-swipe" ref={trackRef} onScroll={onScroll}>
        {comic.pages.map((page, i) => (
          <div key={i} className="comic-page">
            <Image src={page.url} alt={page.pageTitle} width={1024} height={1536}
              className="w-full h-auto" unoptimized priority={i === 0} />
            <div className="page-story">{page.text}</div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="comic-dots">
        {comic.pages.map((_, i) => (
          <i key={i} className={i === active ? "on" : ""} />
        ))}
      </div>

      {/* End */}
      <div className="ak-col" style={{ paddingBottom: 48 }}>
        <div className="endcard" style={{ display: "block" }}>
          <div className="ee">💥</div>
          <h4>{t(lang, "comicEnd")}</h4>
          <p>{t(lang, "comicEndText")} {comic.childName}.</p>
          <button className="cta" onClick={onBack}>{t(lang, "newComicBtn")}</button>
        </div>
      </div>
    </div>
  );
}

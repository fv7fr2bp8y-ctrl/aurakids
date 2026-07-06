"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import StoryDisplay from "./StoryDisplay";
import ComicDisplay, { type ComicData } from "./ComicDisplay";
import type { StoryData } from "./StoryGenerator";
import { getLibrary, type LibraryItem } from "@/lib/library";
import { t } from "@/lib/i18n";
import { Sparkle, Comic as ComicIcon, Moon } from "./Icons";

interface LibraryProps {
  lang: string;
  onBack: () => void;
  onNew: () => void;
}

type Filter = "all" | "comic" | "story";

export default function Library({ lang, onBack, onNew }: LibraryProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<LibraryItem | null>(null);

  useEffect(() => {
    setItems(getLibrary());
  }, []);

  if (open) {
    if (open.type === "comic") {
      return <ComicDisplay comic={open.data as ComicData} lang={open.lang}
        onBack={() => setOpen(null)} onHome={() => setOpen(null)} />;
    }
    return <StoryDisplay story={open.data as StoryData} lang={open.lang}
      onBack={() => setOpen(null)} onHome={() => setOpen(null)} />;
  }

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  const FILTERS: { id: Filter; lk: string }[] = [
    { id: "all", lk: "libAll" },
    { id: "comic", lk: "libComics" },
    { id: "story", lk: "libStories" },
  ];

  return (
    <section className="ak-screen home-hero-bg">
      <div className="stars" />
      <div className="ak-col" style={{ paddingBottom: 110 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "24px 0 6px" }}>
          <button className="iconbtn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {t(lang, "libTitle")}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
              {items.length} {t(lang, "libCount")} · {t(lang, "libSub")}
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, padding: "16px 0 18px" }}>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`lib-chip ${filter === f.id ? "on" : ""}`}>
              {t(lang, f.lk)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14, padding: "60px 20px", lineHeight: 1.6 }}>
            {t(lang, "libEmpty")}
          </p>
        ) : (
          <div className="lib-grid">
            {visible.map((item) => (
              <button key={item.id} className="lib-card" onClick={() => setOpen(item)}>
                <div className="lib-cover">
                  {item.cover && <Image src={item.cover} alt="" fill className="object-cover" unoptimized />}
                  <span className="lib-badge">
                    {item.type === "comic" ? <ComicIcon size={12} /> : <Moon size={12} />}
                    {t(lang, item.type === "comic" ? "libBadgeComic" : "libBadgeStory")}
                  </span>
                </div>
                <span className="lib-title">{item.title}</span>
                <span className="lib-meta">
                  {t(lang, "libFor")} {item.childName} · {new Date(item.date).toLocaleDateString(lang === "bg" ? "bg-BG" : lang)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="lib-foot">
        <button className="cta" onClick={onNew}><Sparkle size={18} /> {t(lang, "libNewBtn")}</button>
      </div>
    </section>
  );
}

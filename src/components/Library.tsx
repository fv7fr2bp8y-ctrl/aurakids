"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import StoryDisplay from "./StoryDisplay";
import ComicDisplay, { type ComicData } from "./ComicDisplay";
import type { StoryData } from "./StoryGenerator";
import { getLibrary, syncLibrary, getFamilyCode, type LibraryItem } from "@/lib/library";
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
  const [code, setCode] = useState("");
  const [showSync, setShowSync] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [restoreCode, setRestoreCode] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setItems(getLibrary());
    setCode(getFamilyCode());
    // Pull the cloud copy and merge in.
    syncLibrary().then(setItems).catch(() => {});
  }, []);

  const restore = async () => {
    if (!restoreCode.trim()) return;
    setSyncing(true);
    try {
      const merged = await syncLibrary(restoreCode.trim());
      setItems(merged);
      setCode(getFamilyCode());
      setShowSync(false);
      setRestoreCode("");
    } finally {
      setSyncing(false);
    }
  };

  if (open) {
    if (open.type === "comic") {
      return <ComicDisplay comic={open.data as ComicData} lang={open.lang}
        onBack={() => setOpen(null)} onHome={() => setOpen(null)} />;
    }
    return <StoryDisplay story={open.data as StoryData} lang={open.lang}
      onBack={() => setOpen(null)} onHome={() => setOpen(null)} />;
  }

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);
  const emptyKey = filter === "comic" ? "libEmptyComics" : filter === "story" ? "libEmptyStories" : "libEmpty";

  const FILTERS: { id: Filter; lk: string; glyph?: string }[] = [
    { id: "all", lk: "libAll" },
    { id: "comic", lk: "libComics", glyph: "💥" },
    { id: "story", lk: "libStories", glyph: "🌙" },
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
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {t(lang, "libTitle")}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
              {items.length} {t(lang, "libCount")} · {t(lang, "libSub")}
            </p>
          </div>
          {/* Cloud sync toggle — keeps the main layout matching the design */}
          <button className="iconbtn" onClick={() => setShowCode((s) => !s)} title={t(lang, "libCode")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          </button>
        </div>

        {/* Family code / sync across devices — hidden by default */}
        {showCode && (
        <div className="lib-sync">
          <div className="lib-code-row">
            <span className="lib-code-label">{t(lang, "libCode")}</span>
            <button className="lib-code" onClick={() => { navigator.clipboard?.writeText(code); }} title={t(lang, "libCopyCode")}>
              {code || "…"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="lib-restore-btn" onClick={() => setShowSync((s) => !s)}>{t(lang, "libRestore")}</button>
          </div>
          <p className="lib-code-hint">{t(lang, "libCodeHint")}</p>
          {showSync && (
            <div className="lib-restore">
              <input value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)}
                placeholder="AURA-XXXX-XXXX" className="lib-restore-input" />
              <button className="cta" style={{ height: 44, maxWidth: 130 }} onClick={restore} disabled={syncing}>
                {syncing ? "…" : t(lang, "libLoad")}
              </button>
            </div>
          )}
        </div>
        )}

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, padding: "16px 0 18px" }}>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`lib-chip ${filter === f.id ? "on" : ""}`}>
              {f.glyph ? `${f.glyph} ` : ""}{t(lang, f.lk)}
            </button>
          ))}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14, padding: "60px 20px", lineHeight: 1.6 }}>
            {t(lang, emptyKey)}
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

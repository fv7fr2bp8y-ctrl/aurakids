"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LANGS, t } from "@/lib/i18n";
import { Library as LibraryIcon, Sparkle, Comic as ComicIcon, Share as ShareIcon } from "./Icons";
import { soleFormat as buildSoleFormat } from "@/lib/appConfig";
import { shareApp } from "@/lib/share";

interface HeroSectionProps {
  lang: string;
  onLangChange: (l: string) => void;
  onStartStory: () => void;
  onStartComic: () => void;
  onOpenLibrary: () => void;
  onHome?: () => void;
  soleFormat?: "story" | "comic" | null;
}

function Stars5() {
  return (
    <span className="stars-row">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" fill="#FFD93D">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

const DOOR_PROMPTS = {
  story: "A cozy magical bedtime scene: a small child in starry pajamas sitting up in bed with a teddy bear, reading a glowing open storybook; a shimmering golden stream of magic rises from the pages into dreamy clouds holding a fairytale castle, a tiny sailing ship, a hot-air balloon and a friendly golden dragon; crescent moon and stars, star-lamp on the nightstand, rich purples and warm gold, soft dreamy night atmosphere",
  comic: "A thrilled child superhero mid-leap over city rooftops at sunset, cape flying, dynamic action pose, comic book energy with motion lines and bright bold colors, joyful adventurous expression, cinematic wide angle",
};

const ASSETS = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";
const DOOR_COVERS = {
  story: `${ASSETS}/door-story-card.png`,
  comic: `${ASSETS}/door-comic.png`, // 00-original-reference — hero over comic panels
};

function DoorImage({ kind }: { kind: "story" | "comic" }) {
  const [url, setUrl] = useState<string | null>(null);
  const [coverOk, setCoverOk] = useState(true);

  useEffect(() => {
    if (coverOk) return;
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: DOOR_PROMPTS[kind] }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setUrl(d.url))
      .catch(() => {});
  }, [kind, coverOk]);

  return (
    <div className="door-img">
      {coverOk ? (
        <Image src={DOOR_COVERS[kind]} alt="" fill className="object-cover" unoptimized
          onError={() => setCoverOk(false)} />
      ) : (
        url && <Image src={url} alt="" fill className="object-cover" unoptimized />
      )}
    </div>
  );
}

function LangDropdown({ lang, onLangChange }: { lang: string; onLangChange: (l: string) => void }) {
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.id === lang) || LANGS[0];

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="lang-dd" onClick={(e) => e.stopPropagation()}>
      <button className="lang-trigger" onClick={() => setOpen((o) => !o)} aria-label="Език">
        <span style={{ fontSize: 19 }}>{cur.flag}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button key={l.id} className={`lang-item ${l.id === lang ? "on" : ""}`}
              onClick={() => { onLangChange(l.id); setOpen(false); }}>
              <span style={{ fontSize: 18 }}>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSection({ lang, onLangChange, onStartStory, onStartComic, onOpenLibrary, onHome, soleFormat: soleProp }: HeroSectionProps) {
  const soleFormat = soleProp !== undefined ? soleProp : buildSoleFormat;
  const [shared, setShared] = useState("");

  const doShare = async () => {
    const title = soleFormat === "comic" ? t(lang, "doorComicTitle") : t(lang, "doorStoryTitle");
    const res = await shareApp(`AuraKids · ${title}`, t(lang, "shareText"));
    if (res) { setShared(res); setTimeout(() => setShared(""), 1800); }
  };

  return (
    <section className="ak-screen home-hero-bg">
      <div className="stars" />
      <div className="glow" style={{ width: 240, height: 240, background: "rgba(255,107,107,0.18)", top: 120, right: -60 }} />
      <div className="glow" style={{ width: 200, height: 200, background: "rgba(155,111,232,0.25)", top: 420, left: -70 }} />

      <div className="ak-col">
        {/* Nav */}
        <div className="home-nav">
          <button className="brandrow" onClick={onHome} aria-label="Начало"
            style={{ background: "none", border: "none", cursor: onHome ? "pointer" : "default", padding: 0 }}>
            <Image src={`${ASSETS}/logo-mark-v3.png`} alt="AuraKids" width={56} height={56} unoptimized
              style={{ borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)" }} />
            <span className="wm">Aura<span className="wm-kids">Kids</span>{soleFormat && (
              <span className="wm-sub">{t(lang, soleFormat === "comic" ? "appTagComic" : "appTagStory")}</span>
            )}</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="iconbtn" onClick={doShare} title={t(lang, "shareBtn")}>
              {shared ? <span style={{ fontSize: 15 }}>✓</span> : <ShareIcon size={17} />}
            </button>
            <LangDropdown lang={lang} onLangChange={onLangChange} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 0 40px" }}>
          <span className="badge-chip" data-rise style={{ animationDelay: ".05s" }}>
            {t(lang, "badge")}
          </span>

          <h1 className={`hero-h1 ${soleFormat ? "solo" : ""}`} data-rise style={{ animationDelay: ".12s" }}>
            {t(lang, "h1a")}<br />{t(lang, "h1b")}<br />
            <span className="shimmer">{t(lang, "h1c")}</span>
          </h1>

          <p className="hero-sub" data-rise style={{ animationDelay: ".2s" }}>
            {soleFormat === "comic" ? t(lang, "subComic") : t(lang, "sub")}
          </p>

          {soleFormat ? (
            /* Dedicated build: one big door for this app's format */
            <div data-rise style={{ animationDelay: ".28s", marginTop: 26 }}>
              <button className={`app-door door-${soleFormat} door-solo`}
                onClick={soleFormat === "comic" ? onStartComic : onStartStory}>
                <DoorImage kind={soleFormat} />
                <span className="door-title">{t(lang, soleFormat === "comic" ? "doorComicTitle" : "doorStoryTitle")}</span>
                <span className="door-desc">{t(lang, soleFormat === "comic" ? "doorComicDesc" : "doorStoryDesc")}</span>
                <span className="door-cta">
                  {soleFormat === "comic" ? <ComicIcon size={18} /> : <Sparkle size={18} />}
                  &nbsp;{t(lang, soleFormat === "comic" ? "doorComicCtaFull" : "doorStoryCtaFull")}
                </span>
              </button>
            </div>
          ) : (
            <div data-rise style={{ animationDelay: ".28s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 26 }}>
              <button className="app-door door-story" onClick={onStartStory}>
                <DoorImage kind="story" />
                <span className="door-title">{t(lang, "doorStoryTitle")}</span>
                <span className="door-desc">{t(lang, "doorStoryDesc")}</span>
                <span className="door-cta">{t(lang, "doorStoryCta")}</span>
              </button>
              <button className="app-door door-comic" onClick={onStartComic}>
                <DoorImage kind="comic" />
                <span className="door-title">{t(lang, "doorComicTitle")}</span>
                <span className="door-desc">{t(lang, "doorComicDesc")}</span>
                <span className="door-cta">{t(lang, "doorComicCta")}</span>
              </button>
            </div>
          )}

          <button className="cta ghost" data-rise onClick={onOpenLibrary}
            style={{ animationDelay: ".34s", marginTop: 14, height: 48 }}>
            <LibraryIcon size={18} /> {t(lang, "libTitle")}
          </button>

          <div className="micro" data-rise style={{ animationDelay: ".4s" }}>
            <span>{t(lang, "micro1")}</span><span className="dot">·</span>
            <span>{t(lang, "micro2")}</span><span className="dot">·</span>
            <span>{t(lang, "micro3")}</span>
          </div>

          <div className="rating" data-rise style={{ animationDelay: ".46s" }}>
            <Stars5 />
            <span><strong style={{ color: "#fff" }}>4.9 / 5</strong> {t(lang, "rating")}</span>
          </div>

          <a href="/privacy" style={{ display: "block", marginTop: 22, fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
            {t(lang, "privacy")}
          </a>
        </div>
      </div>
    </section>
  );
}

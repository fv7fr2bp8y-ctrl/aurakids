"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StoryData } from "./StoryGenerator";
import { useStoryVoice, DEFAULT_VOICE } from "@/hooks/useStoryVoice";
import { t } from "@/lib/i18n";
import { Sparkle } from "./Icons";

interface StoryDisplayProps {
  story: StoryData;
  lang?: string;
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

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

const VOICES = [
  { id: "Schedar", name: "Аура", desc: "Топъл, спокоен" },
  { id: "Kore", name: "Мира", desc: "Ясен, женски" },
  { id: "Aoede", name: "Лина", desc: "Мек, приказен" },
  { id: "Leda", name: "Ния", desc: "Млад, нежен" },
  { id: "Charon", name: "Борис", desc: "Дълбок, мъжки" },
  { id: "Puck", name: "Тео", desc: "Закачлив" },
];

export default function StoryDisplay({ story, lang: langProp, onBack, onHome }: StoryDisplayProps) {
  const lang = langProp || story.language || "bg";
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [voiceMenu, setVoiceMenu] = useState(false);
  const fullStoryText = story.voiceText || `${story.title}.\n\n${story.story}`;
  const sv = useStoryVoice(fullStoryText, voice, lang);
  // Record the whole story in the background as soon as it is open, so the
  // play button usually starts at once.
  const { record } = sv;
  useEffect(() => { record(); }, [record]);
  const { url: heroUrl, loading: heroLoading } = useIllustration(story.imagePrompts?.[0]);
  const voiceName = VOICES.find((v) => v.id === voice)?.name ?? "Аура";

  const paragraphs = story.story
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  // Two extra in-story illustrations
  const { url: midUrl, loading: midLoading } = useIllustration(story.imagePrompts?.[1]);
  const { url: endImgUrl, loading: endImgLoading } = useIllustration(story.imagePrompts?.[2]);

  const handlePrint = () => window.print();
  const handleCopy = () => {
    navigator.clipboard.writeText(`${story.title}\n\n${story.story}`).catch(() => {});
  };
  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: `Виж приказката „${story.title}" — създадена специално за ${story.childName} с AuraKids ✨`,
      url: typeof window !== "undefined" ? window.location.origin : "https://aurakids.fun",
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); }
    } catch { /* user cancelled */ }
  };

  // Split paragraphs into thirds for the two mid illustrations
  const third = Math.ceil(paragraphs.length / 3);
  const part1 = paragraphs.slice(0, third);
  const part2 = paragraphs.slice(third, third * 2);
  const part3 = paragraphs.slice(third * 2);

  function Illus({ url, loading, caption }: { url: string | null; loading: boolean; caption: string }) {
    return (
      <div className="story-illus">
        {url ? (
          <Image src={url} alt={caption} fill className="object-contain" unoptimized style={{ zIndex: 1 }} />
        ) : (
          <>
            <div className="stars" />
            {loading && (
              <svg className="animate-spin-ak" width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.7)", zIndex: 1 }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </>
        )}
        {url && <div className="scap">{caption}</div>}
      </div>
    );
  }

  return (
    <div className="reader-screen">
      {/* Illustration header */}
      <div className="reader-illus">
        {heroUrl ? (
          <>
            {/* The whole picture, never cropped; the sides are filled with a
                blurred copy so the wide header still looks full. */}
            <Image src={heroUrl} alt="" aria-hidden fill className="object-cover illus-bg" unoptimized style={{ zIndex: 0 }} />
            <Image src={heroUrl} alt={story.title} fill className="object-contain illus-fg" unoptimized style={{ zIndex: 1 }} />
          </>
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
            <button className="iconbtn" onClick={handleShare} title="Сподели">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </button>
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
        <span className="chapter-tag">{t(lang, "storyFor")} {story.childName}</span>
        <h1 className="chapter-title">{story.title}</h1>
        <div className="prose">
          {part1.map((p, i) => (
            <p key={`a${i}`} className={i === 0 ? "drop" : undefined}>{p}</p>
          ))}
          {part2.length > 0 && (
            <Illus url={midUrl} loading={midLoading} caption={`${story.childName} ${t(lang, "midCaption")}`} />
          )}
          {part2.map((p, i) => (
            <p key={`b${i}`}>{p}</p>
          ))}
          {part3.length > 0 && (
            <Illus url={endImgUrl} loading={endImgLoading} caption={t(lang, "endCaption")} />
          )}
          {part3.map((p, i) => (
            <p key={`c${i}`}>{p}</p>
          ))}
        </div>

        <div className="endcard">
          <div className="ee" style={{ color: "var(--ak-gold)", display: "flex", justifyContent: "center" }}>
            <Sparkle size={40} />
          </div>
          <h4>{t(lang, "theEnd")}</h4>
          <p>{t(lang, "endText")} {story.childName}.</p>
          <button className="cta" onClick={onBack}><Sparkle size={18} /> {t(lang, "newStoryBtn")}</button>
        </div>
      </div>

      {/* Voice player (variant B): a floating card with what is played and
          what is already recorded; the start plays while the rest records. */}
      <div className="vplayer">
        <div className="vplayer-card">
          <div className="vplayer-row">
            <button className="vplay" onClick={sv.toggle} aria-label={sv.status === "playing" ? t(lang, "pause") : t(lang, "tapToListen")}>
              {sv.status === "preparing" || sv.status === "buffering" ? (
                <svg className="animate-spin-ak" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : sv.status === "playing" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <div className="vmeta">
              <div className="vtitle">{t(lang, "readsFor").replace("{voice}", sv.voiceName || voiceName).replace("{name}", story.childName)}</div>
              <div className="vsub">
                {sv.status === "error" ? t(lang, "voiceError")
                  : sv.ready === 0 ? t(lang, "voicePreparing")
                  : sv.ready < sv.total ? t(lang, "voiceFirstReady")
                  : t(lang, "voiceAllReady")}
              </div>
            </div>
            {sv.status === "playing" ? (
              <div className="vwave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
            ) : !sv.voiceName && (
              /* Voice choice only where the voice can change (free voice) */
              <div className="voicechip-wrap">
                {voiceMenu && (
                  <>
                    <div className="voicechip-backdrop" onClick={() => setVoiceMenu(false)} />
                    <div className="voicechip-menu">
                      {VOICES.map((v) => (
                        <button key={v.id} className={v.id === voice ? "on" : ""}
                          onClick={() => { setVoice(v.id); setVoiceMenu(false); }}>
                          <span className="vname">{v.name}</span>
                          <span className="vdesc">{v.desc}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <button className="voicechip dark" onClick={() => setVoiceMenu((m) => !m)} aria-label={t(lang, "voiceLabel")}>
                  <span className="voicechip-name">{voiceName}</span>
                  <svg className="voicechip-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: voiceMenu ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="vbar" aria-hidden="true">
            <i className="rec" style={{ width: `${Math.min(100, (sv.recordedSec / Math.max(1, sv.estTotal)) * 100)}%` }} />
            <i className="play" style={{ width: `${Math.min(100, (sv.played / Math.max(1, sv.estTotal)) * 100)}%` }} />
          </div>
          <div className="vtimes">
            <span>{fmtTime(sv.played)}</span>
            <span>{sv.ready < sv.total
              ? t(lang, "voiceRecorded").replace("{a}", fmtTime(sv.recordedSec)).replace("{b}", fmtTime(sv.estTotal))
              : fmtTime(sv.estTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

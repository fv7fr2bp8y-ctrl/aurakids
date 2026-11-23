"use client";

import { useEffect, useRef, useState } from "react";

// "Чуй сам": a real excerpt made by AuraKids itself (story text by the story
// model, picture by the image model, voice by the site's own
// subscriber voice, ElevenLabs v3), instead of invented reviews and numbers.
const SRC = "/samples/maya-otkas.mp3";
const COVER = "/samples/maya-cover.jpg";

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function ListenExcerpt({ onStart }: { onStart: () => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onMeta = () => setDur(el.duration);
    const onEnd = () => { setPlaying(false); setTime(0); };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => {}); }
    else { el.pause(); setPlaying(false); }
  };

  const pct = dur ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <section className="py-28 px-6" style={{ background: "#1A0533" }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#9B6FE8" }}>
            Чуй сам
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Ето как звучи
            <br />
            <span style={{ color: "rgba(255,255,255,0.65)" }}>една вечер с AuraKids</span>
          </h2>
          <p className="mt-6 text-base" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            Откъс от истинска приказка, създадена на AuraKids. Героинята се казва Мая.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COVER} alt="Мая с гълъба Мърморко се изкачва по заснежената планина" loading="lazy"
            style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", display: "block" }} />
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white">Мая и драконът, който плачеше със сажди</h3>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.75)", fontStyle: "italic", lineHeight: 1.8 }}>
              &bdquo;Но Мая, която беше само на пет години и половина, беше видяла нещо, което никой друг не забеляза: когато драконът прелетя над комините, от очите му капнаха две едри черни капки, тежки като въглен...&ldquo;
            </p>

            <audio ref={audio} src={SRC} preload="metadata" />
            <div className="mt-6 flex items-center gap-4">
              <button onClick={toggle} aria-label={playing ? "Пауза" : "Пусни откъса"}
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 56, height: 56, borderRadius: 28, background: "#FFD93D", border: 0, cursor: "pointer" }}>
                {playing ? (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#1A0533"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                ) : (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#1A0533"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <div className="flex-1" style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: 6, background: "#FFD93D", transition: "width .25s linear" }} />
              </div>
              <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                {fmt(playing || time ? time : dur)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button onClick={onStart} className="cta" style={{ maxWidth: 360, margin: "0 auto" }}>
            Направи такава за твоето дете
          </button>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Първата приказка е безплатна</p>
        </div>
      </div>
    </section>
  );
}

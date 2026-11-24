"use client";
/* eslint-disable @next/next/no-img-element -- small static JPGs, already sized */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import StoryGenerator from "@/components/StoryGenerator";
import Footer from "@/components/Footer";
import type { KoledaVariant } from "@/lib/abtest";
import { isNameClean } from "@/lib/nameFilter";
import { trackEvent } from "@/lib/analytics";
import "./koleda.css";

// Christmas landing page, three variants under test (A/B/C). The winner is the
// variant with the most finished stories, not the most clicks.

type Theme = { id: string; label: string; description: string };

const XMAS: Theme = {
  id: "xmas", label: "Коледа",
  description: "Коледа: сняг, украсена елха, Дядо Коледа, джуджета и подаръци, топла празнична нощ",
};
const LETTER: Theme = {
  id: "xmas-letter", label: "Писмо от Дядо Коледа",
  description: "Коледна приказка, която започва като писмо от Дядо Коледа до детето по име: той разказва какво хубаво е видял през годината и кани детето в коледно приключение със сняг, елени и джуджета",
};
const PLOTS: (Theme & { img: string })[] = [
  { id: "xmas-bell", label: "Изгубеното звънче", img: "/koleda/bell-2.jpg",
    description: "Коледа: в снежната гора детето намира златното звънче, което малък елен на Дядо Коледа е изгубил, и му помага да го върне навреме за коледната нощ" },
  { id: "xmas-elves", label: "Работилницата на джуджетата", img: "/koleda/elves-2.jpg",
    description: "Коледа: детето попада в работилницата на джуджетата на Северния полюс и им помага да довършат последните подаръци преди Бъдни вечер" },
  { id: "xmas-snowman", label: "Снежният човек, който мечтаеше за лято", img: "/koleda/snowman-2.jpg",
    description: "Коледа: снежен човек мечтае да види лятото, а детето измисля как да му подари парченце лято, без той да се разтопи" },
];

// Christmas Eve, 00:00 in Sofia (UTC+2).
const XMAS_EVE = Date.UTC(2026, 11, 23, 22, 0, 0);

function track(variant: KoledaVariant, e: "view" | "click" | "story" | "paywall", preview: boolean) {
  if (preview) return;
  try {
    fetch("/api/ab", {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ v: variant, e }),
    }).catch(() => {});
  } catch { /* counting must never break the page */ }
}

function NameField({ value, onChange, onEnter, light }: { value: string; onChange: (v: string) => void; onEnter: () => void; light?: boolean }) {
  return (
    <input className={`kl-input ${light ? "light" : ""}`} type="text" value={value} maxLength={20}
      placeholder="Името на детето" aria-label="Името на детето"
      onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onEnter()} />
  );
}

// "Чуй как звучи": a 34-second sample of the Аура voice. Plays only on tap.
function AudioSample({ variant, light }: { variant: KoledaVariant; light?: boolean }) {
  const au = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(34);
  const sent = useRef(false);
  const toggle = () => {
    const a = au.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      if (!sent.current) { sent.current = true; trackEvent("koleda_audio_play", { variant }); }
    } else a.pause();
  };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className={`kl-audio ${light ? "light" : ""}`}>
      <button type="button" className="kl-audio-pp" onClick={toggle} aria-label={on ? "Спри откъса" : "Пусни откъса"}>
        {on
          ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
          : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>}
      </button>
      <div className="kl-audio-txt">
        <b>Чуй как звучи</b>
        <div className="kl-audio-bar"><i style={{ width: `${dur ? (t / dur) * 100 : 0}%` }} /></div>
        <div className="kl-audio-row"><span>{fmt(t)}</span><span>{fmt(dur)}</span></div>
      </div>
      <audio ref={au} src="/koleda/otkas-aura.mp3" preload="none"
        onPlay={() => setOn(true)} onPause={() => setOn(false)} onEnded={() => { setOn(false); setT(0); }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 34)} />
    </div>
  );
}

export default function KoledaApp({ variant, preview }: { variant: KoledaVariant; preview: boolean }) {
  const [name, setName] = useState("");
  const [plot, setPlot] = useState(0);
  const [started, setStarted] = useState<Theme | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track(variant, "view", preview);
  }, [variant, preview]);

  useEffect(() => {
    if (variant !== "C") return;
    const tick = () => setLeft(Math.max(0, XMAS_EVE - Date.now()));
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, [variant]);

  const nameOk = isNameClean(name);
  const start = (theme: Theme) => {
    if (name.trim() && !nameOk) return;
    track(variant, "click", preview);
    trackEvent("koleda_cta_click", { variant });
    setStarted(theme);
    window.scrollTo(0, 0);
  };

  if (started) {
    return (
      <main className="flex flex-col min-h-screen">
        <StoryGenerator format="story" lang="bg" onLangChange={() => {}}
          preset={{ name, theme: started }}
          onEvent={(e) => track(variant, e, preview)}
          onBack={() => setStarted(null)} onHome={() => setStarted(null)} />
      </main>
    );
  }

  const nameError = name.trim() && !nameOk
    ? <p className="kl-err">Избери друго име, моля.</p> : null;

  const days = left === null ? null : Math.floor(left / 86400000);
  const hours = left === null ? null : Math.floor((left % 86400000) / 3600000);
  const mins = left === null ? null : Math.floor((left % 3600000) / 60000);
  const pad = (n: number | null) => (n === null ? "··" : String(n).padStart(2, "0"));

  return (
    <main className="kl" data-variant={variant}>
      {variant === "A" && (
        <section className="kl-a kl-snow">
          <div className="kl-col">
            <Link className="kl-brand" href="/">AuraKids</Link>
            <div className="kl-a-art"><img src="/koleda/hero-2.jpg" alt="Дете чете вълшебна книга до коледната елха" /></div>
            <h1 className="kl-a-h1">Коледна приказка, в която <em>твоето дете</em> е героят</h1>
            <p className="kl-lead">Напиши името и за минута получаваш приказка с картинки, която някой ще ти прочете на глас.</p>
            <AudioSample variant={variant} />
            <NameField value={name} onChange={setName} onEnter={() => start(XMAS)} />
            {nameError}
            <button className="kl-cta gold" onClick={() => start(XMAS)}>✨ Създай коледната приказка</button>
            <p className="kl-trust">Опитай безплатно · Готово за около минута</p>
          </div>
        </section>
      )}

      {variant === "B" && (
        <section className="kl-b">
          <div className="kl-b-top kl-snow">
            <div className="kl-col">
              <Link className="kl-brand" href="/">AuraKids · Коледа</Link>
              <div className="kl-env">
                <img src="/koleda/plik-2.jpg" alt="Червен коледен плик с марка от Северния полюс" />
                <span className="kl-env-to">До: {name.trim() || "твоето дете"}</span>
              </div>
            </div>
          </div>
          <div className="kl-col kl-b-body">
            <div className="kl-letter">
              <h1 className="kl-b-h1">Писмо от Дядо Коледа с името на детето ти</h1>
              <p className="kl-letter-text">„Здравей, {name.trim() || "приятелю"}! Тази година джуджетата ми разказаха за теб нещо много специално...“</p>
            </div>
            <div className="kl-steps">
              <div><b>1</b>Името на детето</div>
              <div><b>2</b>Възрастта</div>
              <div><b>3</b>Приказка с картинки и глас</div>
            </div>
            <AudioSample variant={variant} light />
            <NameField value={name} onChange={setName} onEnter={() => start(LETTER)} light />
            {nameError}
            <button className="kl-cta green" onClick={() => start(LETTER)}>🎁 Направи коледното писмо</button>
            <p className="kl-trust dark">Опитай безплатно · Приказката остава в библиотеката ти</p>
          </div>
        </section>
      )}

      {variant === "C" && (
        <section className="kl-c">
          <div className="kl-c-top kl-snow">
            <div className="kl-col">
              <Link className="kl-brand" href="/">AuraKids</Link>
              <div className="kl-count" aria-label="Оставащо време до Бъдни вечер">
                <div><b>{pad(days)}</b><span>ДНИ</span></div>
                <div><b>{pad(hours)}</b><span>ЧАСА</span></div>
                <div><b>{pad(mins)}</b><span>МИН</span></div>
              </div>
              <h1 className="kl-c-h1">Всяка вечер до Коледа една нова приказка</h1>
              <p className="kl-lead">Избери сюжет. Детето ти е героят във всяка.</p>
            </div>
          </div>
          <div className="kl-col">
            <div className="kl-plots" role="radiogroup" aria-label="Сюжет">
              {PLOTS.map((p, i) => (
                <button key={p.id} role="radio" aria-checked={plot === i}
                  className={`kl-plot ${plot === i ? "sel" : ""}`} onClick={() => setPlot(i)}>
                  <img src={p.img} alt="" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
            <AudioSample variant={variant} light />
            <NameField value={name} onChange={setName} onEnter={() => start(PLOTS[plot])} light />
            {nameError}
            <button className="kl-cta red" onClick={() => start(PLOTS[plot])}>🎄 Започни коледната приказка</button>
            <p className="kl-trust dark">Опитай безплатно · Всички приказки остават в библиотеката</p>
          </div>
        </section>
      )}

      <section className="kl-seo">
        <div className="kl-col">
          <h2>Коледна приказка с името на детето</h2>
          <p>В AuraKids детето ти не слуша поредната приказка за някой друг. То е героят. Пишеш името и възрастта му, а ние за около минута създаваме нова коледна история с три картинки, нарисувани точно за нея. Приказката може да се чете или да се слуша: гласът „Аура“ я разказва спокойно, точно като за преди сън.</p>
          <h3>Как става</h3>
          <p>Първо въвеждаш името на детето. После избираш възрастта, за да е подходяща дължината и думите. След това приказката е готова: заглавие, текст, картинки и глас. Всяка приказка е единствена. Никое друго дете не е получавало точно тази история.</p>
          <h3>Защо коледна приказка с името на детето е хубав подарък</h3>
          <p>Децата обичат да чуват името си. Когато героят, който помага на джуджетата или намира изгубеното звънче на елена, е самото дете, приказката се помни. Много семейства я четат на Бъдни вечер, други я пускат всяка вечер през декември. Можеш да я запазиш в библиотеката си и да я отвориш пак, когато детето поиска.</p>
          <h3>За кои години е</h3>
          <p>Приказките са за деца от 3 години нагоре. За най-малките историята е по-кратка и по-нежна, а за по-големите има повече приключение. Текстът е на български, а приказката може да се създаде и на английски, немски, френски или руски.</p>
          <h3>Безопасно ли е</h3>
          <p>Пазим само това, което трябва, за да се създаде приказката. Не показваме реклами на децата. Подробности има в политиката за поверителност.</p>
          <h3>Колко струва</h3>
          <p>Можеш да опиташ безплатно. Ако искаш нова приказка всяка вечер, абонаментът е 4,99 € на месец или 39,99 € на година, с 7 дни безплатно в началото. Можеш да го спреш по всяко време.</p>
          <button className="kl-cta gold" style={{ marginTop: 18 }}
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}>Към коледната приказка</button>
        </div>
      </section>
      <Footer lang="bg" />
    </main>
  );
}

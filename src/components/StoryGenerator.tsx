"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import StoryDisplay from "./StoryDisplay";
import ComicDisplay, { type ComicData } from "./ComicDisplay";
import { LANGS, t } from "@/lib/i18n";
import { saveToLibrary } from "@/lib/library";
import { prefetchStoryVoice, DEFAULT_VOICE } from "@/hooks/useStoryVoice";
import { Sparkle, Comic as ComicIcon, Check } from "./Icons";
import { canGenerate, recordGeneration, initUnlock, checkServerUnlock, isStoreApp } from "@/lib/demo";
import { getFamilyCode } from "@/lib/library";
import { isNameClean } from "@/lib/nameFilter";
import { trackEvent } from "@/lib/analytics";
import { playBillingAvailable, playPrices, buyPlay, restorePlay } from "@/lib/playClient";

const ASSETS = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";
const WORLD_IMG: Record<string, string> = {
  dragon: `${ASSETS}/world-dragon.png`,
  space: `${ASSETS}/world-space.png`,
  forest: `${ASSETS}/world-forest.png`,
  mermaid: `${ASSETS}/world-ocean.png`,
  superhero: `${ASSETS}/world-superhero.png`,
  fairy: `${ASSETS}/world-fairy.png`,
  xmas: "/koleda/hero-2.jpg",
};
const STYLE_IMG: Record<string, string> = {
  pixar: `${ASSETS}/style-pixar.png`,
  cartoon: `${ASSETS}/style-cartoon.png`,
  manga: `${ASSETS}/style-manga.png`,
  retro: `${ASSETS}/style-retro.png`,
};

interface StoryGeneratorProps {
  format: "story" | "comic";
  lang: string;
  onLangChange: (l: string) => void;
  onBack: () => void;
  onHome?: () => void;
  // Landing pages (e.g. /koleda) arrive with the world chosen and maybe the
  // name typed: the creator then only asks what is still missing.
  preset?: { name?: string; theme: { id: string; label: string; description: string } };
  onEvent?: (e: "story" | "paywall") => void;
}

const THEMES = [
  { id: "xmas", glyph: "🎄", lk: "thXmas", dk: "thXmasD", description: "Коледа: сняг, украсена елха, Дядо Коледа, джуджета и подаръци, топла празнична нощ" },
  { id: "dragon", glyph: "🐉", lk: "thDragon", dk: "thDragonD", description: "Дракони, замъци и приключения" },
  { id: "space", glyph: "🚀", lk: "thSpace", dk: "thSpaceD", description: "Звезди, планети и извънземни" },
  { id: "forest", glyph: "🌿", lk: "thForest", dk: "thForestD", description: "Говорещи животни и тайни пътеки" },
  { id: "mermaid", glyph: "🧜", lk: "thMermaid", dk: "thMermaidD", description: "Русалки, рибки и съкровища" },
  { id: "superhero", glyph: "🦸", lk: "thSuper", dk: "thSuperD", description: "Спасяване на света с особени сили" },
  { id: "fairy", glyph: "🧚", lk: "thFairy", dk: "thFairyD", description: "Вълшебна пръчка и изпълнени желания" },
];



const THEME_COVERS: Record<string, string> = {
  dragon: "A majestic friendly dragon curled around a treasure-filled castle tower at golden hour, tiny sparkles, epic yet warm",
  space: "A cute rocket ship soaring past ringed planets and a smiling crescent moon in deep violet space, golden star trails",
  forest: "An enchanted forest clearing with giant glowing mushrooms, fireflies and a friendly fox peeking from ancient trees",
  mermaid: "An underwater coral palace with shimmering fish, pearls and a gentle sea turtle, sunbeams piercing turquoise water",
  superhero: "A heroic cape fluttering over a vibrant city skyline at sunset, comic-style energy, bold dynamic composition",
  xmas: "A snowy fairy-tale village on Christmas night with a glowing decorated Christmas tree, warm windows and a reindeer sleigh crossing the moon",
  fairy: "A tiny fairy village inside glowing flowers with sparkling magic dust and butterfly wings, dreamy pastel light",
  custom: "A magical glowing door standing alone in a starfield, slightly open with golden light and question-mark shaped sparkles spilling out, mysterious and inviting",
  retro: "A brave kid superhero mid-action in a classic vintage American comic book style: bold black ink outlines, Ben-Day halftone dots, punchy primary colors, dynamic pose with motion lines, retro comic energy",
};

function TileImage({ id, src }: { id?: string; src?: string }) {
  // Prefer a fixed brand-kit image; generate from a prompt when there isn't one.
  const fixed = src || (id ? WORLD_IMG[id] : undefined);
  const [url, setUrl] = useState<string | null>(fixed ?? null);
  const [failed, setFailed] = useState(false);
  const needsGen = !fixed || failed;

  useEffect(() => {
    if (!needsGen) return;
    const prompt = id ? THEME_COVERS[id] : undefined;
    if (!prompt) return;
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((r) => r.json())
      .then((d) => d.url && setUrl(d.url))
      .catch(() => {});
  }, [id, needsGen]);

  return (
    <div className="tile-img">
      {url && <Image src={url} alt="" fill className="object-cover" unoptimized
        onError={() => { setFailed(true); setUrl(null); }} />}
    </div>
  );
}



export interface StoryData {
  childName: string;
  theme: string;
  story: string;
  title: string;
  imagePrompts: string[];
  language?: string;
  voiceText?: string; // same story with stress marks, for the voice only
}

export default function StoryGenerator({ format, lang, onLangChange, onBack, onHome, preset, onEvent }: StoryGeneratorProps) {
  // With a preset world there is no world step: name → age → story.
  const LAST = preset ? 2 : 3;
  const [step, setStep] = useState(preset?.name?.trim() ? 2 : 1);
  const [childName, setChildName] = useState(preset?.name?.trim() ?? "");
  const [selectedTheme, setSelectedTheme] = useState(preset?.theme.id ?? "");
  const [selectedAge, setSelectedAge] = useState("");
  const [artStyle, setArtStyle] = useState("pixar");
  const [s3Tab, setS3Tab] = useState<"world" | "style">("world");
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [comicData, setComicData] = useState<ComicData | null>(null);
  const [error, setError] = useState("");
  const [demoBlocked, setDemoBlocked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [plan, setPlan] = useState<"year" | "month">("year");
  const [subPrices, setSubPrices] = useState<{ month: number; year: number; currency: string } | null>(null);
  // Inside the Play app with Play Billing: the paywall pays through Google.
  const [playOk, setPlayOk] = useState(false);

  useEffect(() => {
    initUnlock();
    // A paid family code unlocks any device it's restored on.
    checkServerUnlock(getFamilyCode()).catch(() => {});
    // In the Play app: Google's prices, and re-attach a subscription Play
    // already has (new phone, reinstall).
    playBillingAvailable().then((ok) => {
      if (!ok) return;
      setPlayOk(true);
      playPrices().then((p) => p && setSubPrices(p));
      restorePlay(getFamilyCode()).catch(() => {});
    });
    // Subscription prices for the paywall (from the server, not hard-coded).
    if (!isStoreApp()) fetch("/api/checkout").then((r) => r.json()).then((d) => {
      const s = d?.subscription;
      if (s?.month && s?.year) setSubPrices({ month: Number(s.month), year: Number(s.year), currency: String(s.currency || "eur") });
    }).catch(() => {});
  }, []);

  // Local price format: "4,99 €" in BG/DE/FR/RU, "€4.99" in EN.
  const money = (amount: number, currency = "eur") => {
    const locale = ({ bg: "bg-BG", en: "en-IE", de: "de-DE", fr: "fr-FR", ru: "ru-RU" } as Record<string, string>)[lang] || "bg-BG";
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase(), minimumFractionDigits: 2 }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
    }
  };

  const startCheckout = async () => {
    trackEvent("begin_checkout", { plan, currency: "EUR", value: plan === "year" ? 39.99 : 4.99 });
    setPaying(true);
    setPayError("");
    // Play app: Google Play Billing only (no Stripe inside Play apps).
    if (isStoreApp()) {
      try {
        if (playOk && await buyPlay(plan, getFamilyCode())) { setDemoBlocked(false); setError(""); return; }
        setPayError(t(lang, "payUnavailable"));
      } catch {
        setPayError(t(lang, "payUnavailable"));
      } finally {
        setPaying(false);
      }
      return;
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: getFamilyCode(), plan }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setPayError(t(lang, "payUnavailable"));
    } catch {
      setPayError(t(lang, "payUnavailable"));
    } finally {
      setPaying(false);
    }
  };

  const prefetchRef = useRef<Promise<Record<string, unknown>> | null>(null);
  const prefetchKeyRef = useRef<string>("");

  const yrs = t(lang, "yrs");
  const AGES = [`3–4 ${yrs}`, `5–6 ${yrs}`, `7–8 ${yrs}`, `9–10 ${yrs}`, `11–12 ${yrs}`, `13+ ${yrs}`];
  const LOAD_STEPS = format === "comic"
    ? [t(lang, "cls1"), t(lang, "cls2"), t(lang, "cls3"), t(lang, "cls4")]
    : [t(lang, "ls1"), t(lang, "ls2"), t(lang, "ls3"), t(lang, "ls4")];

  const activeTheme = preset && selectedTheme === preset.theme.id
    ? { label: preset.theme.label, description: preset.theme.description }
    : selectedTheme === "custom"
    ? { label: "Изненада", description: "Изненадващ, необичаен и запомнящ се свят по избор на разказвача — нещо, което детето не очаква" }
    : (() => { const th = THEMES.find((x) => x.id === selectedTheme); return th ? { label: t(lang, th.lk), description: th.description } : undefined; })();

  // Speculative pre-fetch once all fields ready
  useEffect(() => {
    // Only for stories, and only when this visitor may generate one: every
    // prefetch is a paid AI call and counts against the daily limit.
    if (format !== "story" || !canGenerate("story")) return;
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}|${lang}`;
    if (prefetchKeyRef.current === key) return;
    const timer = setTimeout(() => {
      // The button may have started this very story meanwhile: don't pay twice.
      if (prefetchKeyRef.current === key) return;
      prefetchKeyRef.current = key;
      prefetchRef.current = fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          theme: activeTheme?.description,
          themeName: activeTheme?.label,
          age: selectedAge,
          language: lang,
        }),
      }).then((r) => r.json());
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childName, selectedTheme, selectedAge]);

  // Loading checklist: earlier steps get checked, the current one keeps a
  // spinner until generation really finishes (story ~25s, comic ~2-3min).
  // Variant A (23.11.2026): honest steps. A story only waits for the text
  // (~40 s); pictures and voice come in the reader. The bar fills by elapsed
  // time against the usual duration and stops short of the end.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
    const t0 = Date.now();
    const t = setInterval(() => {
      const sec = (Date.now() - t0) / 1000;
      setElapsed(sec);
      setLoadStep(format === "comic"
        ? Math.min(Math.floor(sec / 30), LOAD_STEPS.length - 1)
        : sec < 1.5 ? 0 : 1);
    }, 500);
    return () => { clearInterval(t); setElapsed(0); setLoadStep(0); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);
  const expectedSec = format === "comic" ? 100 : 45;
  const barPct = Math.min(95, 4 + (elapsed / expectedSec) * 91);
  const STEP_HINTS = format === "comic" ? [] : ["", t(lang, "ls2h"), t(lang, "ls3h"), t(lang, "ls4h")];

  // Rotating magic one-liners to keep the wait alive.
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    if (!isLoading) return;
    setTipIdx(0);
    const t = setInterval(() => setTipIdx((i) => i + 1), 5500);
    return () => clearInterval(t);
  }, [isLoading]);

  const nameOk = isNameClean(childName);
  const canProceed =
    (step === 1 && !!childName.trim() && nameOk) ||
    (step === 2 && !!selectedAge && (LAST === 2 ? !!selectedTheme : true)) ||
    (step === 3 && !!selectedTheme);

  const handleNext = () => {
    if (!canProceed) return;
    if (step < LAST) { setStep(step + 1); return; }
    // Web demo: one story + one comic, then upsell the full app.
    if (!canGenerate(format)) { setDemoBlocked(true); onEvent?.("paywall"); return; }
    handleGenerate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  // The server said no (daily limit). Free web visitors see the paywall;
  // paid families and the Play app get a "come back tomorrow" message.
  const onLimit = (scope: unknown) => {
    if (scope === "free" && (!isStoreApp() || playOk)) { setDemoBlocked(true); onEvent?.("paywall"); return; }
    setError(t(lang, scope === "busy" ? "errBusy" : "errLimit"));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    try {
      // ---- Comic path ----
      if (format === "comic") {
        const res = await fetch("/api/generate-comic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childName: childName.trim(),
            theme: activeTheme?.description || selectedTheme,
            age: selectedAge,
            language: lang,
            artStyle,
          }),
        });
        if (res.status === 429) { onLimit((await res.json().catch(() => ({})))?.scope); return; }
        if (!res.ok) throw new Error("fail");
        const comic = await res.json();
        if (comic.error) throw new Error(String(comic.error));
        const comicData: ComicData = { childName: childName.trim(), title: comic.title, pages: comic.pages };
        saveToLibrary({ type: "comic", title: comic.title, childName: childName.trim(), lang, cover: comic.pages[0]?.url ?? null, data: comicData });
        recordGeneration("comic");
        trackEvent("comic_ready");
        setComicData(comicData);
        return;
      }

      // ---- Story path ----
      const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}|${lang}`;
      let data: Record<string, unknown>;
      if (prefetchRef.current && prefetchKeyRef.current === key) {
        data = await prefetchRef.current;
      } else {
        // Claim the key first so a pending prefetch timer won't start a second,
        // paid copy of the same story (seen 23.11.2026: two calls per story).
        prefetchKeyRef.current = key;
        const res = await fetch("/api/generate-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childName: childName.trim(),
            theme: activeTheme?.description || selectedTheme,
            themeName: activeTheme?.label || selectedTheme,
            age: selectedAge,
            language: lang,
          }),
        });
        if (!res.ok && res.status !== 429) throw new Error("fail");
        data = await res.json();
      }
      if (data.error === "limit") {
        // A prefetch that hit the limit must not be reused for the next try.
        prefetchRef.current = null; prefetchKeyRef.current = "";
        onLimit(data.scope);
        return;
      }
      if (data.error) throw new Error(String(data.error));

      // Warm up images + voice in parallel so the Reader is instant
      const prompts = (data.imagePrompts as string[]) || [];
      const warmups = prompts.map((p) =>
        p ? fetch("/api/generate-image", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p }),
        }).then((r) => r.json()).then((d) => (d.url as string) || null).catch(() => null)
          : Promise.resolve(null)
      );
      if (data.title && data.story) {
        // Same text and voice as the player's play button, so a tap during the
        // warm-up waits for this one instead of paying for a second recording.
        prefetchStoryVoice((data.voiceText as string) || `${data.title}.\n\n${data.story}`, DEFAULT_VOICE, lang);
      }

      const storyResult = { childName: childName.trim(), theme: activeTheme?.label || selectedTheme, language: lang, ...data } as StoryData;
      // Save to library once the cover image is ready (or without one on failure)
      (warmups[0] ?? Promise.resolve(null)).then((cover) => {
        saveToLibrary({ type: "story", title: storyResult.title, childName: storyResult.childName, lang, cover, data: storyResult });
      });
      recordGeneration("story");
      setStoryData(storyResult);
      onEvent?.("story");
      trackEvent("story_ready", { theme: String(selectedTheme) });
    } catch {
      setError(t(lang, format === "comic" ? "errComic" : "errStory"));
    } finally {
      setIsLoading(false);
    }
  };

  if (comicData) {
    return <ComicDisplay comic={comicData} lang={lang} onBack={() => { setComicData(null); setStep(1); }} onHome={onBack} />;
  }

  if (storyData) {
    return <StoryDisplay story={storyData} lang={lang} onBack={() => { setStoryData(null); setStep(1); }} onHome={onBack} />;
  }

  if (demoBlocked) {
    const prices = subPrices ?? { month: 4.99, year: 39.99, currency: "eur" };
    const planCard = (id: "year" | "month") => {
      const selected = plan === id;
      return {
        position: "relative" as const, width: "100%", boxSizing: "border-box" as const, padding: 20, borderRadius: 20,
        background: selected ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
        border: selected ? "2px solid #ffc847" : "1px solid rgba(255,255,255,0.2)",
        color: "#fff", font: "inherit", textAlign: "left" as const, display: "flex", flexDirection: "column" as const, gap: 6, cursor: "pointer",
      };
    };
    return (
      <section className="ak-screen home-hero-bg">
        <div className="stars" />
        <div className="ak-col" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, paddingTop: 40, paddingBottom: 32 }}>
          <h2 className="step-q" style={{ textAlign: "center" }}>{t(lang, "payTitle")}</h2>
          <p className="step-help" style={{ textAlign: "center", margin: "0 auto 8px", maxWidth: 320 }}>{t(lang, "payBody")}</p>
          <div role="radiogroup" aria-label={t(lang, "payTitle")} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380, width: "100%", margin: "0 auto" }}>
            <button role="radio" aria-checked={plan === "year"} onClick={() => setPlan("year")} style={planCard("year")}>
              <span style={{ position: "absolute", top: -12, right: 16, padding: "4px 10px", borderRadius: 12, background: "#ffc847", color: "#2a1052", fontSize: 12, fontWeight: 800 }}>{t(lang, "yearBadge")}</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>{t(lang, "planYear")}</span>
              <span style={{ fontSize: 24, fontWeight: 800 }}>{money(prices.year, prices.currency)} <span style={{ fontSize: 14, fontWeight: 600, color: "#e4d8ff" }}>{t(lang, "perYear")}</span></span>
              <span style={{ fontSize: 14, color: "#e4d8ff" }}>{t(lang, "yearPerMonth").replace("{x}", money(Math.floor((prices.year / 12) * 100) / 100, prices.currency))}</span>
            </button>
            <button role="radio" aria-checked={plan === "month"} onClick={() => setPlan("month")} style={planCard("month")}>
              <span style={{ fontSize: 17, fontWeight: 800 }}>{t(lang, "planMonth")}</span>
              <span style={{ fontSize: 24, fontWeight: 800 }}>{money(prices.month, prices.currency)} <span style={{ fontSize: 14, fontWeight: 600, color: "#e4d8ff" }}>{t(lang, "perMonth")}</span></span>
              <span style={{ fontSize: 14, color: "#e4d8ff" }}>{t(lang, "monthNote")}</span>
            </button>
            <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.6, color: "#e4d8ff" }}>{t(lang, "planIncludes")}</p>
            <button className="cta" onClick={startCheckout} disabled={paying} style={{ marginTop: 8 }}>
              <Sparkle size={18} /> {paying ? "…" : t(lang, "trialCta")}
            </button>
            <p style={{ margin: 0, fontSize: 13, color: "#e4d8ff", textAlign: "center" }}>{t(lang, "trialNote")}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#cbbcf2", textAlign: "center", lineHeight: 1.5 }}>
              {t(lang, "renewNote")} <a href="/usloviya" style={{ color: "#ffd93d" }}>{t(lang, "terms")}</a>.
            </p>
            {payError && (
              <p style={{ fontSize: 13, color: "#ff9a9a", margin: 0, textAlign: "center" }}>{payError}</p>
            )}
            <button className="cta ghost" onClick={onBack}>{t(lang, "notNow")}</button>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="ak-screen home-hero-bg">
      <div className="stars" />

      <div className="ak-col">
        {/* Top bar with progress */}
        <div className="create-top">
          <button className="iconbtn" onClick={handleBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(step / LAST) * 100}%` }} />
          </div>
          <span className="progress-count">{step} / {LAST}</span>
          {onHome && (
            <button onClick={onHome} aria-label="Начало" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flex: "0 0 auto" }}>
              <Image src={`${ASSETS}/logo-mark-v5.png`} alt="AuraKids" width={32} height={32} unoptimized
                style={{ borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)", display: "block" }} />
            </button>
          )}
        </div>

        <div className="create-body">
          {/* Step 1 — name */}
          {step === 1 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">{t(lang, "s1eyebrow")}</span>
              <h2 className="step-q">{t(lang, "s1q")}</h2>
              <p className="step-help">{t(lang, "s1help")}</p>
              <input
                className={`tinput ${childName ? "filled" : ""}`}
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={t(lang, "namePlaceholder")}
                maxLength={20}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {!nameOk && (
                <p style={{ marginTop: 10, fontSize: 13.5, fontWeight: 600, color: "var(--ak-coral)" }}>
                  {t(lang, "nameNotAllowed")}
                </p>
              )}
              <p className="step-help" style={{ margin: "30px 0 12px" }}>{t(lang, "langQ")}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {LANGS.map((l) => (
                  <button key={l.id} className={`lang-sq ${lang === l.id ? "sel" : ""}`}
                    onClick={() => onLangChange(l.id)} aria-label={l.label} title={l.label}>
                    {l.flag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — age */}
          {step === 2 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">{t(lang, "s2eyebrow")}</span>
              <h2 className="step-q">{childName.trim() ? t(lang, "s2qN").replace("{n}", childName.trim()) : t(lang, "s2q")}</h2>
              <p className="step-help">{t(lang, "s2help")}</p>
              <div className="age-grid">
                {AGES.map((age) => (
                  <button key={age} className={`chip ${selectedAge === age ? "sel" : ""}`} onClick={() => setSelectedAge(age)}>
                    {age}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — world (+ style for comics) */}
          {step === 3 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">{t(lang, "s3eyebrow")}</span>
              <h2 className="step-q">{s3Tab === "style" ? t(lang, "styleQ") : t(lang, "s3q")}</h2>
              <p className="step-help">{s3Tab === "style" ? t(lang, "styleHelp") : t(lang, "s3help")}</p>

              {/* Segmented switch — only comics have a style step */}
              {format === "comic" && (
                <div className="segmented">
                  <button className={s3Tab === "world" ? "on" : ""} onClick={() => setS3Tab("world")}>
                    {t(lang, "tabWorld")}
                  </button>
                  <button className={s3Tab === "style" ? "on" : ""} onClick={() => setS3Tab("style")}>
                    {t(lang, "tabStyle")}
                  </button>
                </div>
              )}

              {s3Tab === "world" ? (
                <>
                  <div className={`theme-grid ${format === "comic" ? "" : "pop-tight"}`}>
                    {THEMES.map((th) => (
                      <button key={th.id} className={`tile tile-cover ${th.id === "xmas" ? "tile-feature" : ""} ${selectedTheme === th.id ? "sel-gold" : ""}`}
                        onClick={() => setSelectedTheme(th.id)}>
                        <TileImage id={th.id} />
                        {th.id === "xmas" && <img className="xmas-pop" src="/koleda/xmas-pop.webp" alt="" aria-hidden="true" />}
                        <span className="tlabel">{t(lang, th.lk)}</span>
                        <span className="tdesc">{t(lang, th.dk)}</span>
                      </button>
                    ))}
                    {/* Custom — slim full-width bar */}
                    <button className={`tile tile-wide ${selectedTheme === "custom" ? "sel-gold" : ""}`}
                      onClick={() => setSelectedTheme("custom")}>
                      <span>
                        <span className="tlabel">{t(lang, "newWorld")}</span>
                        <span className="tdesc" style={{ display: "block" }}>{t(lang, "newWorldDesc")}</span>
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="theme-grid">
                  {([
                    { id: "pixar", lk: "stPixar", dk: "stPixarD" },
                    { id: "cartoon", lk: "stCartoon", dk: "stCartoonD" },
                    { id: "manga", lk: "stManga", dk: "stMangaD" },
                    { id: "retro", lk: "stRetro", dk: "stRetroD" },
                  ] as const).map((st) => (
                    <button key={st.id} className={`tile tile-cover ${artStyle === st.id ? "sel-gold" : ""}`}
                      onClick={() => setArtStyle(st.id)}>
                      <TileImage id={STYLE_IMG[st.id] ? undefined : st.id} src={STYLE_IMG[st.id]} />
                      <span className="tlabel">{t(lang, st.lk)}</span>
                      <span className="tdesc">{t(lang, st.dk)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 18, padding: "16px", borderRadius: 14, background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)", textAlign: "center" }}>
              <p style={{ color: "#ff9a9a", fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{error}</p>
              <button className="cta ghost" style={{ height: 44, maxWidth: 220, margin: "0 auto" }}
                onClick={handleGenerate}>
                {t(lang, "retryBtn")}
              </button>
            </div>
          )}

          <div className="create-foot">
            <button className={`cta ${canProceed ? "" : "disabled"}`} onClick={handleNext}>
              {step < LAST ? (
                t(lang, "continueBtn")
              ) : format === "comic" ? (
                <><ComicIcon size={18} /> {t(lang, "ctaComic")} {childName || t(lang, "heroFallback")}</>
              ) : (
                <>{t(lang, "ctaStory")} {childName || t(lang, "heroFallback")}</>
              )}
            </button>
            {step === 1 && (
              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
                {t(lang, "micro1")} · {t(lang, "micro2")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading">
          <div className="stars" />
          <div className="glow" style={{ width: 260, height: 260, background: "rgba(255,107,107,0.15)", top: "8%", right: "-15%" }} />
          <div className="glow" style={{ width: 220, height: 220, background: "rgba(155,111,232,0.22)", bottom: "10%", left: "-12%" }} />
          {/* Soft glowing particles drifting upward behind the orb */}
          <div className="dust" aria-hidden>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="dot-glyph" style={{
                left: `${(i * 7.1 + 3) % 100}%`,
                width: `${3 + (i % 4) * 2}px`,
                height: `${3 + (i % 4) * 2}px`,
                animationDelay: `${(i % 7) * 0.8}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }} />
            ))}
          </div>
          <div className="orb">
            <span className="ring" />
            <span className="orbit"><i /><i /><i /></span>
            <Image className="orb-img orb-mascot" src={`${ASSETS}/orb-story.png`}
              alt="" width={150} height={150} unoptimized />
          </div>
          <h3>{format === "comic" ? t(lang, "loadComic") : t(lang, "loadStoryFor").replace("{name}", childName.trim())}</h3>
          <p>{t(lang, format === "comic" ? "loadWaitComic" : "loadWait")}</p>
          {/* Live progress toward completion */}
          <div className="load-bar" aria-hidden>
            <span style={{ width: `${barPct}%` }} />
          </div>
          <div className="steps">
            {LOAD_STEPS.map((label, i) => (
              <div key={label} className={i < loadStep ? "done" : i === loadStep ? "active" : ""}>
                <span className="mk">{i < loadStep && <Check size={13} />}</span>
                <span className="lbl">{label}{STEP_HINTS[i] && <small>{STEP_HINTS[i]}</small>}</span>
              </div>
            ))}
          </div>
          <p className="load-tip" key={tipIdx}>
            {t(lang, (format === "comic" ? ["lctip1", "lctip2", "lctip3", "lctip4"] : ["ltip1", "ltip2", "ltip3", "ltip4"])[tipIdx % 4])}
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import StoryDisplay from "./StoryDisplay";
import ComicDisplay, { type ComicData } from "./ComicDisplay";
import { LANGS, t } from "@/lib/i18n";
import { saveToLibrary } from "@/lib/library";
import { Sparkle, Comic as ComicIcon, Check } from "./Icons";

const ASSETS = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images";
const WORLD_IMG: Record<string, string> = {
  dragon: `${ASSETS}/world-dragon.png`,
  space: `${ASSETS}/world-space.png`,
  forest: `${ASSETS}/world-forest.png`,
  mermaid: `${ASSETS}/world-ocean.png`,
  superhero: `${ASSETS}/world-superhero.png`,
  fairy: `${ASSETS}/world-fairy.png`,
};
const STYLE_IMG: Record<string, string> = {
  pixar: `${ASSETS}/style-pixar.png`,
  cartoon: `${ASSETS}/style-cartoon.png`,
  manga: `${ASSETS}/style-manga.png`,
};

interface StoryGeneratorProps {
  format: "story" | "comic";
  lang: string;
  onLangChange: (l: string) => void;
  onBack: () => void;
}

const THEMES = [
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
  fairy: "A tiny fairy village inside glowing flowers with sparkling magic dust and butterfly wings, dreamy pastel light",
  custom: "A magical glowing door standing alone in a starfield, slightly open with golden light and question-mark shaped sparkles spilling out, mysterious and inviting",
};

function TileImage({ id, src }: { id?: string; src?: string }) {
  // Prefer a fixed brand-kit image; fall back to generating one only if it fails.
  const fixed = src || (id ? WORLD_IMG[id] : undefined);
  const [url, setUrl] = useState<string | null>(fixed ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!failed) return;
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
  }, [id, failed]);

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
}

export default function StoryGenerator({ format, lang, onLangChange, onBack }: StoryGeneratorProps) {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [artStyle, setArtStyle] = useState("pixar");
  const [s3Tab, setS3Tab] = useState<"world" | "style">("world");
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [comicData, setComicData] = useState<ComicData | null>(null);
  const [error, setError] = useState("");

  const prefetchRef = useRef<Promise<Record<string, unknown>> | null>(null);
  const prefetchKeyRef = useRef<string>("");

  const yrs = t(lang, "yrs");
  const AGES = [`3–4 ${yrs}`, `5–6 ${yrs}`, `7–8 ${yrs}`, `9–10 ${yrs}`, `11–12 ${yrs}`, `13+ ${yrs}`];
  const LOAD_STEPS = format === "comic"
    ? [t(lang, "cls1"), t(lang, "cls2"), t(lang, "cls3"), t(lang, "cls4")]
    : [t(lang, "ls1"), t(lang, "ls2"), t(lang, "ls3"), t(lang, "ls4")];

  const activeTheme = selectedTheme === "custom"
    ? (customTheme.trim()
        ? { label: customTheme.trim(), description: customTheme.trim() }
        : { label: "Изненада", description: "Изненадващ, необичаен и запомнящ се свят по избор на разказвача — нещо, което детето не очаква" })
    : (() => { const th = THEMES.find((x) => x.id === selectedTheme); return th ? { label: t(lang, th.lk), description: th.description } : undefined; })();

  // Speculative pre-fetch once all fields ready
  useEffect(() => {
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}|${lang}`;
    if (prefetchKeyRef.current === key) return;
    const timer = setTimeout(() => {
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
  }, [childName, selectedTheme, customTheme, selectedAge]);

  // Loading checklist animation
  useEffect(() => {
    if (!isLoading) return;
    setLoadStep(0);
    const t = setInterval(() => setLoadStep((s) => Math.min(s + 1, LOAD_STEPS.length - 1)), format === "comic" ? 30000 : 2200);
    return () => clearInterval(t);
  }, [isLoading]);

  const canProceed =
    (step === 1 && !!childName.trim()) ||
    (step === 2 && !!selectedAge) ||
    (step === 3 && !!selectedTheme);

  const handleNext = () => {
    if (!canProceed) return;
    if (step < 3) { setStep(step + 1); return; }
    handleGenerate();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
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
        if (!res.ok) throw new Error("fail");
        const comic = await res.json();
        if (comic.error) throw new Error(String(comic.error));
        const comicData: ComicData = { childName: childName.trim(), title: comic.title, pages: comic.pages };
        saveToLibrary({ type: "comic", title: comic.title, childName: childName.trim(), lang, cover: comic.pages[0]?.url ?? null, data: comicData });
        setComicData(comicData);
        return;
      }

      // ---- Story path ----
      const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}|${lang}`;
      let data: Record<string, unknown>;
      if (prefetchRef.current && prefetchKeyRef.current === key) {
        data = await prefetchRef.current;
      } else {
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
        if (!res.ok) throw new Error("fail");
        data = await res.json();
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
        fetch("/api/tts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `${data.title}.\n\n${data.story}`, language: lang }),
        }).catch(() => {});
      }

      const storyResult = { childName: childName.trim(), theme: activeTheme?.label || selectedTheme, language: lang, ...data } as StoryData;
      // Save to library once the cover image is ready (or without one on failure)
      (warmups[0] ?? Promise.resolve(null)).then((cover) => {
        saveToLibrary({ type: "story", title: storyResult.title, childName: storyResult.childName, lang, cover, data: storyResult });
      });
      setStoryData(storyResult);
    } catch {
      setError(t(lang, "errGeneric"));
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
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <span className="step-count">{step} / 3</span>
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
              <p className="step-help" style={{ margin: "22px 0 10px" }}>{t(lang, "langQ")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LANGS.map((l) => (
                  <button key={l.id} className={`chip ${lang === l.id ? "sel" : ""}`}
                    style={{ padding: "10px 14px", fontSize: 14 }}
                    onClick={() => onLangChange(l.id)}>
                    {l.flag} {l.label}
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
                  <div className="theme-grid">
                    {THEMES.map((th) => (
                      <button key={th.id} className={`tile tile-cover ${selectedTheme === th.id ? "sel-gold" : ""}`}
                        onClick={() => setSelectedTheme(th.id)}>
                        <TileImage id={th.id} />
                        <span className="tlabel">{t(lang, th.lk)}</span>
                        <span className="tdesc">{t(lang, th.dk)}</span>
                      </button>
                    ))}
                    {/* Custom — slim full-width bar */}
                    <button className={`tile tile-wide ${selectedTheme === "custom" ? "sel-gold" : ""}`}
                      onClick={() => setSelectedTheme("custom")}>
                      <Sparkle size={20} className="text-[color:var(--ak-gold)]" />
                      <span>
                        <span className="tlabel">{t(lang, "newWorld")}</span>
                        <span className="tdesc" style={{ display: "block" }}>{t(lang, "newWorldDesc")}</span>
                      </span>
                    </button>
                  </div>

                  {selectedTheme === "custom" && (
                    <input
                      className={`tinput ${customTheme.trim() ? "filled" : ""}`}
                      style={{ marginTop: 14, fontSize: 16 }}
                      type="text"
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      placeholder={t(lang, "newWorldPh")}
                      maxLength={60}
                      autoFocus
                    />
                  )}
                </>
              ) : (
                <div className="theme-grid">
                  {([
                    { id: "pixar", lk: "stPixar", dk: "stPixarD" },
                    { id: "cartoon", lk: "stCartoon", dk: "stCartoonD" },
                    { id: "manga", lk: "stManga", dk: "stMangaD" },
                  ] as const).map((st) => (
                    <button key={st.id} className={`tile tile-cover ${artStyle === st.id ? "sel-gold" : ""}`}
                      onClick={() => setArtStyle(st.id)}>
                      <TileImage src={STYLE_IMG[st.id]} />
                      <span className="tlabel">{t(lang, st.lk)}</span>
                      <span className="tdesc">{t(lang, st.dk)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.15)", color: "#ff8a8a", fontSize: 14, textAlign: "center" }}>
              {error}
            </div>
          )}

          <div className="create-foot">
            <button className={`cta ${canProceed ? "" : "disabled"}`} onClick={handleNext}>
              {step < 3 ? (
                t(lang, "continueBtn")
              ) : format === "comic" ? (
                <><ComicIcon size={18} /> {t(lang, "ctaComic")} {childName || t(lang, "heroFallback")}</>
              ) : (
                <><Sparkle size={18} /> {t(lang, "ctaStory")} {childName || t(lang, "heroFallback")}</>
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
          <div className="orb">
            <span className="ring" />
            <Sparkle size={46} className="text-white" />
          </div>
          <h3>{format === "comic" ? t(lang, "loadComic") : t(lang, "loadStory")}</h3>
          <p>{t(lang, "loadSub")}</p>
          <div className="steps">
            {LOAD_STEPS.map((label, i) => (
              <div key={label} className={i <= loadStep ? "done" : ""}>
                <span className="mk">{i <= loadStep && <Check size={13} />}</span> {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

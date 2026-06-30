"use client";

import { useState, useEffect, useRef } from "react";
import StoryDisplay from "./StoryDisplay";

interface StoryGeneratorProps {
  onBack: () => void;
}

const THEMES = [
  { id: "dragon", glyph: "🐉", label: "Дракони", desc: "Смели полети и съкровища", description: "Дракони, замъци и приключения" },
  { id: "space", glyph: "🚀", label: "Космос", desc: "Звезди и далечни планети", description: "Звезди, планети и извънземни" },
  { id: "forest", glyph: "🌿", label: "Омагьосана гора", desc: "Приятели сред дърветата", description: "Говорещи животни и тайни пътеки" },
  { id: "mermaid", glyph: "🧜", label: "Морско царство", desc: "Дълбини и русалки", description: "Русалки, рибки и съкровища" },
  { id: "superhero", glyph: "🦸", label: "Супергерои", desc: "Сила да спасиш деня", description: "Спасяване на света с особени сили" },
  { id: "fairy", glyph: "🧚", label: "Феи", desc: "Блясък и вълшебен прах", description: "Вълшебна пръчка и изпълнени желания" },
];

const AGES = ["2–3 г.", "4–5 г.", "6–7 г.", "8–9 г.", "10+ г.", "Изненадай ме"];

const LOAD_STEPS = ["Измисляме героя", "Пишем приказката", "Рисуваме илюстрациите", "Записваме гласа"];

export interface StoryData {
  childName: string;
  theme: string;
  story: string;
  title: string;
  imagePrompts: string[];
}

export default function StoryGenerator({ onBack }: StoryGeneratorProps) {
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [error, setError] = useState("");

  const prefetchRef = useRef<Promise<Record<string, unknown>> | null>(null);
  const prefetchKeyRef = useRef<string>("");

  const activeTheme = selectedTheme === "custom"
    ? { label: customTheme.trim(), description: customTheme.trim() }
    : THEMES.find((t) => t.id === selectedTheme);

  // Speculative pre-fetch once all fields ready
  useEffect(() => {
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    if (selectedTheme === "custom" && !customTheme.trim()) return;
    const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}`;
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
    const t = setInterval(() => setLoadStep((s) => Math.min(s + 1, LOAD_STEPS.length - 1)), 2200);
    return () => clearInterval(t);
  }, [isLoading]);

  const canProceed =
    (step === 1 && !!childName.trim()) ||
    (step === 2 && !!selectedAge) ||
    (step === 3 && !!selectedTheme && (selectedTheme !== "custom" || !!customTheme.trim()));

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
      const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}`;
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
          }),
        });
        if (!res.ok) throw new Error("fail");
        data = await res.json();
      }
      if (data.error) throw new Error(String(data.error));

      // Warm up images + voice in parallel so the Reader is instant
      const prompts = (data.imagePrompts as string[]) || [];
      prompts.forEach((p) => {
        if (p) fetch("/api/generate-image", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: p }),
        }).catch(() => {});
      });
      if (data.title && data.story) {
        fetch("/api/tts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `${data.title}.\n\n${data.story}` }),
        }).catch(() => {});
      }

      setStoryData({ childName: childName.trim(), theme: activeTheme?.label || selectedTheme, ...data } as StoryData);
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setIsLoading(false);
    }
  };

  if (storyData) {
    return <StoryDisplay story={storyData} onBack={() => { setStoryData(null); setStep(1); }} onHome={onBack} />;
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
          {/* Step 1 */}
          {step === 1 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">Стъпка 1 · Героят</span>
              <h2 className="step-q">Как се казва детето?</h2>
              <p className="step-help">Това име ще се появява в цялата приказка — детето е истинският герой.</p>
              <input
                className={`tinput ${childName ? "filled" : ""}`}
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="напр. Мария"
                maxLength={20}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">Стъпка 2 · Възраст</span>
              <h2 className="step-q">На колко години е?</h2>
              <p className="step-help">Нагласяме дължината и думите според възрастта.</p>
              <div className="age-grid">
                {AGES.map((age) => (
                  <button key={age} className={`chip ${selectedAge === age ? "sel" : ""}`} onClick={() => setSelectedAge(age)}>
                    {age}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div data-rise>
              <span className="eyebrow step-eyebrow">Стъпка 3 · Светът</span>
              <h2 className="step-q">Изберете свят</h2>
              <p className="step-help">В кой вълшебен свят да се случи приказката?</p>
              <div className="theme-grid">
                {THEMES.map((t) => {
                  const sel = selectedTheme === t.id;
                  const color = `var(--ak-theme-${t.id})`;
                  return (
                    <button key={t.id} className="tile" onClick={() => setSelectedTheme(t.id)}
                      style={sel ? { borderColor: color, background: "rgba(255,255,255,0.10)" } : undefined}>
                      <span className="tglyph">{t.glyph}</span>
                      <span className="tlabel">{t.label}</span>
                      <span className="tdesc">{t.desc}</span>
                    </button>
                  );
                })}
                {/* Custom */}
                <button className="tile" onClick={() => setSelectedTheme("custom")}
                  style={selectedTheme === "custom" ? { borderColor: "#fff", background: "rgba(255,255,255,0.10)" } : undefined}>
                  <span className="tglyph">✏️</span>
                  <span className="tlabel">Друго</span>
                  <span className="tdesc">Напиши свой свят</span>
                </button>
              </div>

              {selectedTheme === "custom" && (
                <input
                  className={`tinput ${customTheme.trim() ? "filled" : ""}`}
                  style={{ marginTop: 14, fontSize: 16 }}
                  type="text"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  placeholder="напр. Динозаври, Пирати, Средновековие…"
                  maxLength={60}
                  autoFocus
                />
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
              {step < 3 ? "Продължи" : `Напиши приказката на ${childName || "героя"}`}
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading">
          <div className="orb">
            <span className="ring" />
            <span>{selectedTheme !== "custom" ? THEMES.find((t) => t.id === selectedTheme)?.glyph ?? "✨" : "✨"}</span>
          </div>
          <h3>Приказката се ражда…</h3>
          <p>Никое друго дете не е получавало точно тази история.</p>
          <div className="steps">
            {LOAD_STEPS.map((label, i) => (
              <div key={label} className={i <= loadStep ? "done" : ""}>
                <span className="mk">{i <= loadStep ? "✓" : ""}</span> {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

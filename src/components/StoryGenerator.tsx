"use client";

import { useState, useEffect, useRef } from "react";
import StoryDisplay from "./StoryDisplay";
import AuraLogo from "./AuraLogo";

interface StoryGeneratorProps {
  onBack: () => void;
}

const THEMES = [
  { id: "dragon", label: "Дракони", description: "Дракони, замъци и приключения" },
  { id: "forest", label: "Вълшебна гора", description: "Говорещи животни и тайни пътеки" },
  { id: "space", label: "Космос", description: "Звезди, планети и извънземни" },
  { id: "mermaid", label: "Подводен свят", description: "Русалки, рибки и съкровища" },
  { id: "superhero", label: "Супергерой", description: "Спасяване на света с особени сили" },
  { id: "fairy", label: "Феи и магия", description: "Вълшебна пръчка и изпълнени желания" },
];

const THEME_COLORS: Record<string, string> = {
  dragon: "#FF6B6B", forest: "#4CAF50", space: "#9B6FE8",
  mermaid: "#4FC3F7", superhero: "#FFD93D", fairy: "#F48FB1",
};

const AGES = ["2-3 години", "4-5 години", "6-7 години", "8-10 години"];

export interface StoryData {
  childName: string;
  theme: string;
  story: string;
  title: string;
  imagePrompts: string[];
}

export default function StoryGenerator({ onBack }: StoryGeneratorProps) {
  const [childName, setChildName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [error, setError] = useState("");

  const prefetchRef = useRef<Promise<Record<string, unknown>> | null>(null);
  const prefetchKeyRef = useRef<string>("");

  // Speculative pre-fetch: start generating as soon as all fields are ready
  useEffect(() => {
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    if (selectedTheme === "custom" && !customTheme.trim()) return;

    const theme = selectedTheme === "custom"
      ? { label: customTheme.trim(), description: customTheme.trim() }
      : THEMES.find((t) => t.id === selectedTheme);

    const key = `${childName.trim()}|${theme?.label}|${selectedAge}`;
    if (prefetchKeyRef.current === key) return;

    const timer = setTimeout(() => {
      prefetchKeyRef.current = key;
      prefetchRef.current = fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          theme: theme?.description,
          themeName: theme?.label,
          age: selectedAge,
        }),
      }).then((r) => r.json());
    }, 600);

    return () => clearTimeout(timer);
  }, [childName, selectedTheme, customTheme, selectedAge]);

  const activeTheme = selectedTheme === "custom"
    ? { label: customTheme.trim(), description: customTheme.trim() }
    : THEMES.find((t) => t.id === selectedTheme);

  const handleGenerate = async () => {
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    if (selectedTheme === "custom" && !customTheme.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const key = `${childName.trim()}|${activeTheme?.label}|${selectedAge}`;
      let data: Record<string, unknown>;

      if (prefetchRef.current && prefetchKeyRef.current === key) {
        // Use already-running or completed prefetch
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
        if (!res.ok) throw new Error("Грешка при генериране");
        data = await res.json();
      }

      if (data.error) throw new Error(String(data.error));
      setStoryData({ childName: childName.trim(), theme: activeTheme?.label || selectedTheme, ...data } as StoryData);
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setIsLoading(false);
    }
  };

  if (storyData) {
    return <StoryDisplay story={storyData} onBack={() => setStoryData(null)} onHome={onBack} />;
  }

  const canGenerate = childName.trim() && selectedTheme && selectedAge &&
    (selectedTheme !== "custom" || customTheme.trim());

  return (
    <div className="min-h-screen px-4 py-12"
      style={{ background: "linear-gradient(160deg, #1A0533 0%, #3B1A6B 60%, #6B35B8 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.6)" }}>
          ← Назад
        </button>

        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex items-center justify-center">
            <AuraLogo size={56} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Кажи ни за героя</h1>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Три въпроса и приказката е готова</p>
        </div>

        <div className="rounded-3xl p-8 space-y-8"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}>

          {/* Step 1 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">
              1. Как се казва нашият герой?
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Напр. Александър, Ева, Никола..."
              maxLength={30}
              className="w-full px-5 py-4 rounded-2xl text-lg outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "2px solid",
                borderColor: childName ? "#FFD93D" : "rgba(255,255,255,0.15)",
                color: "white",
              }}
            />
          </div>

          {/* Step 2 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">
              2. На колко години е героят?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGES.map((age) => (
                <button key={age} onClick={() => setSelectedAge(age)}
                  className="py-3 px-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: selectedAge === age ? "linear-gradient(135deg, #FF6B6B, #FFD93D)" : "rgba(255,255,255,0.08)",
                    color: selectedAge === age ? "#3B1A6B" : "rgba(255,255,255,0.7)",
                    border: selectedAge === age ? "none" : "1px solid rgba(255,255,255,0.12)",
                    fontWeight: selectedAge === age ? 700 : 500,
                  }}>
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">
              3. В какъв свят ще се впусне?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const color = THEME_COLORS[theme.id];
                const selected = selectedTheme === theme.id;
                return (
                  <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}
                    className="flex flex-col items-start p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: selected ? `${color}25` : "rgba(255,255,255,0.06)",
                      border: `2px solid ${selected ? color : "rgba(255,255,255,0.10)"}`,
                    }}>
                    <div className="w-2 h-2 rounded-full mb-2" style={{ background: color }} />
                    <div className="font-semibold text-sm text-white">{theme.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{theme.description}</div>
                  </button>
                );
              })}
              {/* Custom theme */}
              <button onClick={() => setSelectedTheme("custom")}
                className="flex flex-col items-start p-4 rounded-2xl text-left transition-all"
                style={{
                  background: selectedTheme === "custom" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  border: `2px solid ${selectedTheme === "custom" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.10)"}`,
                }}>
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.5)" }} />
                <div className="font-semibold text-sm text-white">Друго</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Напиши свой свят</div>
              </button>
            </div>

            {selectedTheme === "custom" && (
              <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Напр. Динозаври, Пирати, Средновековие..."
                maxLength={60}
                autoFocus
                className="mt-3 w-full px-5 py-4 rounded-2xl text-base outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: `2px solid ${customTheme.trim() ? "#fff" : "rgba(255,255,255,0.2)"}`,
                  color: "white",
                }}
              />
            )}
          </div>

          {error && (
            <div className="text-sm text-center py-3 px-4 rounded-xl"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ff6b6b" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full py-5 rounded-2xl text-lg font-bold text-white transition-all duration-300"
            style={{
              background: canGenerate && !isLoading ? "linear-gradient(135deg, #FF6B6B, #FFD93D)" : "rgba(255,255,255,0.1)",
              color: canGenerate && !isLoading ? "#3B1A6B" : "rgba(255,255,255,0.3)",
              cursor: canGenerate && !isLoading ? "pointer" : "not-allowed",
            }}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Приказката се ражда...
              </span>
            ) : (
              `Напиши приказката на ${childName || "героя"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

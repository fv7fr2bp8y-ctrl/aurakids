"use client";

import { useState } from "react";
import StoryDisplay from "./StoryDisplay";

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
  const [selectedAge, setSelectedAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!childName.trim() || !selectedTheme || !selectedAge) return;
    setIsLoading(true);
    setError("");
    try {
      const theme = THEMES.find((t) => t.id === selectedTheme);
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: childName.trim(),
          theme: theme?.description || selectedTheme,
          themeName: theme?.label || selectedTheme,
          age: selectedAge,
        }),
      });
      if (!res.ok) throw new Error("Грешка при генериране");
      const data = await res.json();
      setStoryData({ childName: childName.trim(), theme: theme?.label || selectedTheme, ...data });
    } catch {
      setError("Нещо се обърка. Опитай отново.");
    } finally {
      setIsLoading(false);
    }
  };

  if (storyData) {
    return <StoryDisplay story={storyData} onBack={() => setStoryData(null)} onHome={onBack} />;
  }

  const canGenerate = childName.trim() && selectedTheme && selectedAge;

  return (
    <div className="min-h-screen px-4 py-12"
      style={{ background: "linear-gradient(160deg, #1A0533 0%, #3B1A6B 60%, #6B35B8 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.6)" }}>
          ← Назад
        </button>

        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Създай вълшебна приказка</h1>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Три стъпки до нещо магическо</p>
        </div>

        <div className="rounded-3xl p-8 space-y-8"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}>

          {/* Step 1 */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-white">
              1. Как се казва детето?
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
              2. На колко години е?
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
              3. Избери тема
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
            </div>
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
                Вълшебството се ражда...
              </span>
            ) : (
              `Създай приказката на ${childName || "детето"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

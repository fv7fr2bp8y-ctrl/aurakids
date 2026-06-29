"use client";

import { useState } from "react";
import StoryDisplay from "./StoryDisplay";

interface StoryGeneratorProps {
  onBack: () => void;
}

const THEMES = [
  { id: "dragon", label: "🐉 Дракони", description: "Дракони, замъци и приключения" },
  { id: "forest", label: "🌳 Вълшебна гора", description: "Говорещи животни и тайни пътеки" },
  { id: "space", label: "🚀 Космос", description: "Звезди, планети и извънземни" },
  { id: "mermaid", label: "🧜 Подводен свят", description: "Русалки, рибки и съкровища" },
  { id: "superhero", label: "🦸 Супергерой", description: "Спасяване на света с особени сили" },
  { id: "fairy", label: "🧚 Феи и магия", description: "Вълшебна пръчка и изпълнени желания" },
];

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
      setStoryData({
        childName: childName.trim(),
        theme: theme?.label || selectedTheme,
        ...data,
      });
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
    <div className="min-h-screen px-4 py-12" style={{ background: "linear-gradient(135deg, #faf7f2 0%, #f0e6ff 50%, #fce7f3 100%)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70" style={{ color: "#7c3aed" }}>
          ← Назад към началото
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🪄</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1a1a2e" }}>
            Създай вълшебна приказка
          </h1>
          <p style={{ color: "#6060a0" }}>Три стъпки до нещо магическо</p>
        </div>

        {/* Form */}
        <div className="glass rounded-3xl p-8 space-y-8" style={{ border: "1px solid rgba(168, 85, 247, 0.2)" }}>

          {/* Step 1: Name */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#7c3aed" }}>
              1. Как се казва детето? ✍️
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Напр. Александър, Ева, Никола..."
              maxLength={30}
              className="w-full px-5 py-4 rounded-2xl text-lg outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.8)",
                border: "2px solid",
                borderColor: childName ? "#7c3aed" : "rgba(168,85,247,0.2)",
                color: "#1a1a2e",
              }}
            />
          </div>

          {/* Step 2: Age */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#7c3aed" }}>
              2. На колко години е? 🎂
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGES.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className="py-3 px-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: selectedAge === age ? "linear-gradient(135deg, #7c3aed, #ec4899)" : "rgba(255,255,255,0.8)",
                    color: selectedAge === age ? "white" : "#4a4a6a",
                    border: selectedAge === age ? "none" : "1px solid rgba(168,85,247,0.2)",
                    transform: selectedAge === age ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Theme */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#7c3aed" }}>
              3. Избери тема за приказката 🌈
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: selectedTheme === theme.id ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12))" : "rgba(255,255,255,0.7)",
                    border: `2px solid ${selectedTheme === theme.id ? "#7c3aed" : "rgba(168,85,247,0.15)"}`,
                  }}
                >
                  <span className="text-2xl">{theme.label.split(" ")[0]}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>
                      {theme.label.substring(theme.label.indexOf(" ") + 1)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#8080a0" }}>
                      {theme.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-center py-3 px-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full py-5 rounded-2xl text-lg font-bold text-white transition-all duration-300"
            style={{
              background: canGenerate && !isLoading
                ? "linear-gradient(135deg, #7c3aed, #ec4899)"
                : "rgba(168,85,247,0.3)",
              transform: canGenerate && !isLoading ? "scale(1)" : "scale(0.98)",
              cursor: canGenerate && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Вълшебството се ражда...
              </span>
            ) : (
              `🪄 Създай приказката на ${childName || "детето"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

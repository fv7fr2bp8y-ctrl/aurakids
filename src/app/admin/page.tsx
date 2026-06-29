"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AuraLogo from "@/components/AuraLogo";

interface Story {
  id: string;
  cache_key: string;
  title: string;
  story: string;
  image_prompts: string[];
  created_at: string;
}

interface FileEntry {
  name: string;
  url: string;
  size?: number;
}

interface AdminData {
  stories: Story[];
  images: FileEntry[];
  audio: FileEntry[];
}

function fmt(bytes?: number) {
  if (!bytes) return "—";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `преди ${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `преди ${h} ч`;
  return `преди ${Math.floor(h / 24)} дни`;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"stories" | "images" | "audio">("stories");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/data?key=${encodeURIComponent(k)}`);
      if (res.status === 401) { setError("Грешна парола"); return; }
      const d = await res.json();
      setData(d);
      setAuthed(true);
    } catch {
      setError("Грешка при зареждане");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    load(key);
  };

  useEffect(() => {
    if (authed) {
      const id = setInterval(() => load(key), 30000);
      return () => clearInterval(id);
    }
  }, [authed, key]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #1A0533, #3B1A6B)" }}>
        <form onSubmit={handleLogin} className="rounded-3xl p-10 w-full max-w-sm"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <AuraLogo size={48} />
            </div>
            <h1 className="text-xl font-bold text-white">AuraKids Admin</h1>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Парола"
            className="w-full px-4 py-3 rounded-2xl mb-4 outline-none text-white"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
          />
          {error && <p className="text-sm text-red-400 mb-3 text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-2xl font-bold transition-all"
            style={{ background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", color: "#3B1A6B" }}>
            {loading ? "Зарежда..." : "Влез"}
          </button>
        </form>
      </div>
    );
  }

  const TABS = [
    { id: "stories" as const, label: "Приказки", count: data?.stories.length ?? 0 },
    { id: "images" as const, label: "Картинки", count: data?.images.length ?? 0 },
    { id: "audio" as const, label: "Аудио", count: data?.audio.length ?? 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0F0520" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between"
        style={{ background: "rgba(59,26,107,0.8)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <AuraLogo size={32} />
          <span className="font-bold text-white">AuraKids Admin</span>
        </div>
        <button onClick={() => load(key)}
          className="text-sm px-4 py-1.5 rounded-full transition-all"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
          Обнови
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 py-6 grid grid-cols-3 gap-4 max-w-4xl mx-auto">
        {TABS.map((t) => (
          <div key={t.id} className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-3xl font-bold text-white">{t.count}</div>
            <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "linear-gradient(135deg, #FF6B6B, #FFD93D)" : "rgba(255,255,255,0.07)",
                color: tab === t.id ? "#3B1A6B" : "rgba(255,255,255,0.6)",
              }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Stories */}
        {tab === "stories" && (
          <div className="space-y-3 pb-12">
            {data?.stories.map((s, i) => (
              <div key={s.id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold" style={{ color: "#FF6B6B" }}>#{i + 1}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{s.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {s.cache_key} · {timeAgo(s.created_at)}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>{expanded === s.id ? "▲" : "▼"}</span>
                </button>
                {expanded === s.id && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <p className="text-sm mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Georgia, serif" }}>
                      {s.story.substring(0, 400)}...
                    </p>
                    {s.image_prompts?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Image prompts:</p>
                        {s.image_prompts.map((p, idx) => (
                          <p key={idx} className="text-xs mb-1 italic" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {idx + 1}. {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {data?.stories.length === 0 && (
              <p className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>Няма генерирани приказки</p>
            )}
          </div>
        )}

        {/* Images */}
        {tab === "images" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-12">
            {data?.images.map((img) => (
              <div key={img.name} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="relative w-full h-36">
                  <Image src={img.url} alt={img.name} fill className="object-cover" unoptimized />
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{img.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{fmt(img.size)}</p>
                </div>
              </div>
            ))}
            {data?.images.length === 0 && (
              <p className="text-center py-12 col-span-3" style={{ color: "rgba(255,255,255,0.3)" }}>Няма запазени картинки</p>
            )}
          </div>
        )}

        {/* Audio */}
        {tab === "audio" && (
          <div className="space-y-3 pb-12">
            {data?.audio.map((a) => (
              <div key={a.name} className="flex items-center justify-between px-5 py-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div>
                  <p className="text-sm text-white font-mono">{a.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{fmt(a.size)}</p>
                </div>
                <audio controls src={a.url} className="h-8" style={{ filter: "invert(1) opacity(0.6)" }} />
              </div>
            ))}
            {data?.audio.length === 0 && (
              <p className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>Няма запазено аудио</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CONCEPTS = [
  { id: "portal-world", label: "Портал към свят" },
  { id: "child-constellation", label: "Дете от звезди" },
  { id: "dragon-spiral", label: "Дракон спирала" },
  { id: "dream-bubble", label: "Мечта на дете" },
];

function LogoCard({ id, label }: { id: string; label: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/generate-logo?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.url) { setUrl(d.url); setStatus("done"); }
        else { setError(d.error || "грешка"); setStatus("error"); }
      })
      .catch(() => setStatus("error"));
  }, [id]);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-purple-100 flex flex-col">
      <div className="relative bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center"
        style={{ height: 280 }}>
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-purple-400">Генерирам...</span>
          </div>
        )}
        {status === "error" && (
          <div className="text-red-400 text-sm text-center px-4">{error}</div>
        )}
        {url && (
          <Image src={url} alt={label} fill className="object-contain p-6" unoptimized />
        )}
      </div>
      <div className="p-4 text-center">
        <p className="font-semibold text-purple-900">{label}</p>
        <p className="text-xs text-purple-400 mt-1">#{id}</p>
      </div>
    </div>
  );
}

export default function LogoPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">Лого концепции</h1>
        <p className="text-center text-purple-500 mb-10">Избери коя харесваш — после я слагаме навсякъде</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CONCEPTS.map((c) => (
            <LogoCard key={c.id} id={c.id} label={c.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

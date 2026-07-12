"use client";

import { useEffect, useState } from "react";
import StoryGenerator from "@/components/StoryGenerator";
import HeroSection from "@/components/HeroSection";
import Library from "@/components/Library";
import HowItWorks from "@/components/HowItWorks";
import StoryPreview from "@/components/StoryPreview";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { soleFormat as buildSoleFormat } from "@/lib/appConfig";

type Mode = "home" | "story" | "comic" | "library";

// `forced` locks this route to one product (used by /prikazki and /komiksi).
// Otherwise it falls back to the build-time sole format (dedicated deploys) or
// the combined app with both doors.
export default function HomeApp({ forced }: { forced?: "story" | "comic" }) {
  const [mode, setMode] = useState<Mode>("home");
  const [lang, setLang] = useState("bg");

  useEffect(() => {
    const saved = localStorage.getItem("ak-lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (l: string) => {
    setLang(l);
    localStorage.setItem("ak-lang", l);
  };

  const sole = forced ?? buildSoleFormat;
  const isBoth = !sole;
  const genFormat: "story" | "comic" = sole ?? (mode === "comic" ? "comic" : "story");
  const startPrimary = () => setMode(sole ?? "story");

  if (mode === "library") {
    return (
      <main className="flex flex-col min-h-screen">
        <Library lang={lang} onBack={() => setMode("home")} onNew={startPrimary} />
      </main>
    );
  }

  if (mode !== "home") {
    return (
      <main className="flex flex-col min-h-screen">
        <StoryGenerator format={genFormat} lang={lang} onLangChange={changeLang}
          onBack={() => setMode("home")} onHome={() => setMode("home")} />
      </main>
    );
  }

  // On the combined home the two doors lead to the dedicated apps, so an
  // install from there picks up the right PWA (name, icon, scope).
  const goStory = isBoth ? () => { window.location.href = "/prikazki"; } : () => setMode("story");
  const goComic = isBoth ? () => { window.location.href = "/komiksi"; } : () => setMode("comic");

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection lang={lang} onLangChange={changeLang} soleFormat={sole}
        onStartStory={goStory} onStartComic={goComic}
        onOpenLibrary={() => setMode("library")}
        onHome={() => { if (isBoth) window.location.href = "/"; else setMode("home"); }} />
      {isBoth && lang === "bg" && (
        <>
          <HowItWorks />
          <StoryPreview onStart={() => setMode("story")} />
          <Testimonials />
        </>
      )}
      <Footer />
    </main>
  );
}

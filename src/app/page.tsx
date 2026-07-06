"use client";

import { useEffect, useState } from "react";
import StoryGenerator from "@/components/StoryGenerator";
import HeroSection from "@/components/HeroSection";
import Library from "@/components/Library";
import HowItWorks from "@/components/HowItWorks";
import StoryPreview from "@/components/StoryPreview";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

type Mode = "home" | "story" | "comic" | "library";

export default function Home() {
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

  if (mode === "library") {
    return (
      <main className="flex flex-col min-h-screen">
        <Library lang={lang} onBack={() => setMode("home")} onNew={() => setMode("story")} />
      </main>
    );
  }

  if (mode !== "home") {
    return (
      <main className="flex flex-col min-h-screen">
        <StoryGenerator format={mode} lang={lang} onLangChange={changeLang} onBack={() => setMode("home")} />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection lang={lang} onLangChange={changeLang}
        onStartStory={() => setMode("story")} onStartComic={() => setMode("comic")}
        onOpenLibrary={() => setMode("library")} />
      {lang === "bg" && (
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

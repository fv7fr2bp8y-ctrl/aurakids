"use client";

import { useState } from "react";
import StoryGenerator from "@/components/StoryGenerator";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import StoryPreview from "@/components/StoryPreview";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

type Mode = "home" | "story" | "comic";

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode !== "home") {
    return (
      <main className="flex flex-col min-h-screen">
        <StoryGenerator format={mode} onBack={() => setMode("home")} />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection onStartStory={() => setMode("story")} onStartComic={() => setMode("comic")} />
      <HowItWorks />
      <StoryPreview onStart={() => setMode("story")} />
      <Testimonials />
      <Footer />
    </main>
  );
}

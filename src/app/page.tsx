"use client";

import { useState } from "react";
import StoryGenerator from "@/components/StoryGenerator";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <main className="flex flex-col min-h-screen">
      {!showGenerator ? (
        <>
          <HeroSection onStart={() => setShowGenerator(true)} />
          <HowItWorks />
          <Testimonials />
          <Footer />
        </>
      ) : (
        <StoryGenerator onBack={() => setShowGenerator(false)} />
      )}
    </main>
  );
}

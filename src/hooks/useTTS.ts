"use client";

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "playing" | "error";

const audioCache = new Map<string, string>();

export function useTTS() {
  const [status, setStatus] = useState<Status>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setStatus("idle");
  }, []);

  const speak = useCallback(
    async (text: string, voice = "Schedar", language = "bg") => {
      if (status === "playing") {
        stop();
        return;
      }

      setStatus("loading");

      try {
        const cacheKey = `${language}|${voice}|${text}`;
        let url = audioCache.get(cacheKey);

        if (!url) {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice, language }),
          });

          if (!res.ok) throw new Error("TTS грешка");

          const blob = await res.blob();
          url = URL.createObjectURL(blob);
          audioCache.set(cacheKey, url);
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => setStatus("idle");
        audio.onerror = () => setStatus("error");

        await audio.play();
        setStatus("playing");
      } catch {
        setStatus("error");
      }
    },
    [status, stop]
  );

  return { speak, stop, status };
}

"use client";

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "playing" | "error";

const audioCache = new Map<string, string>();

// 44-byte silent WAV. Played synchronously inside the user's tap to unlock the
// audio element on iOS — otherwise play() after an awaited fetch is blocked and
// the button appears to need two taps.
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

export function useTTS() {
  const [status, setStatus] = useState<Status>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudio = () => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      audioRef.current = el;
    }
    return audioRef.current;
  };

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setStatus("idle");
  }, []);

  const speak = useCallback(
    async (text: string, voice = "Schedar", language = "bg") => {
      if (status === "playing") {
        stop();
        return;
      }

      // Unlock inside the tap, before any await.
      const el = getAudio();
      el.src = SILENCE;
      el.play().catch(() => {});

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

        el.src = url;
        el.onended = () => setStatus("idle");
        el.onerror = () => setStatus("error");

        await el.play();
        setStatus("playing");
      } catch {
        setStatus("error");
      }
    },
    [status, stop]
  );

  return { speak, stop, status };
}

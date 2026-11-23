"use client";

import { useCallback, useRef, useState } from "react";

type Status = "idle" | "loading" | "playing" | "error";

export const DEFAULT_VOICE = "Schedar";

const audioCache = new Map<string, string>();
// Recordings in flight, shared by the warm-up and the play button.
const inflight = new Map<string, Promise<string>>();

function fetchAudio(text: string, voice: string, language: string): Promise<string> {
  const key = `${language}|${voice}|${text}`;
  const done = audioCache.get(key);
  if (done) return Promise.resolve(done);
  let p = inflight.get(key);
  if (!p) {
    p = fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, language }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("TTS грешка");
        const url = URL.createObjectURL(await res.blob());
        audioCache.set(key, url);
        return url;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

// Start recording in the background (right after the story is written).
export function prefetchTTS(text: string, voice = DEFAULT_VOICE, language = "bg") {
  fetchAudio(text, voice, language).catch(() => {});
}

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
    async (text: string, voice = DEFAULT_VOICE, language = "bg") => {
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
        const url = await fetchAudio(text, voice, language);

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

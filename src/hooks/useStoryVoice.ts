"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The story voice in parts: the first part plays as soon as it is recorded,
// the rest keeps recording meanwhile (a whole story took ~75 s to record).
// All parts of one story share a "group" id, so the server counts the story
// once against the daily / subscriber limits.

export const DEFAULT_VOICE = "Schedar";
const PART_MAX = 1200;
const FIRST_MAX = 320;

export type VoiceStatus = "idle" | "preparing" | "playing" | "paused" | "buffering" | "ended" | "error";

const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

// Paragraph groups of at most ~PART_MAX characters (a long paragraph is cut
// at sentence ends).
export function splitForVoice(text: string, max = PART_MAX): string[] {
  const out: string[] = [];
  let cur = "";
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ""; };
  for (const para of text.split(/\n\s*\n/)) {
    const pieces = para.length > max ? (para.match(/[^.!?…]+[.!?…]*\s*/g) || [para]) : [para];
    for (const piece of pieces) {
      if (cur && cur.length + piece.length + 2 > max) push();
      cur = cur ? `${cur}${para.length > max ? "" : "\n\n"}${piece}` : piece;
    }
    if (para.length > max) push();
  }
  push();
  // A short first part, so the voice starts within seconds; the rest records
  // while it plays.
  if (out[0] && out[0].length > FIRST_MAX) {
    const sent = out[0].match(/[^.!?…]+[.!?…]*\s*/g) || [out[0]];
    let head = "";
    while (sent.length && (head.length + sent[0].length <= FIRST_MAX || !head)) head += sent.shift();
    const rest = sent.join("").trim();
    out.splice(0, 1, head.trim(), ...(rest ? [rest] : []));
  }
  return out;
}

async function groupId(text: string): Promise<string> {
  try {
    const d = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
  } catch {
    return "";
  }
}

// Shared by the warm-up (right after the story is written) and the player.
const done = new Map<string, string>();
const narrator = new Map<string, string>(); // blob url → voice name from the server
const inflight = new Map<string, Promise<string>>();

function fetchPart(text: string, voice: string, language: string, group: string, part: number): Promise<string> {
  const key = `${language}|${voice}|${text}`;
  const ready = done.get(key);
  if (ready) return Promise.resolve(ready);
  let p = inflight.get(key);
  if (!p) {
    p = fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, language, group, part }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`tts ${res.status}`);
        const url = URL.createObjectURL(await res.blob());
        const v = res.headers.get("X-Voice");
        if (v) narrator.set(url, decodeURIComponent(v));
        done.set(key, url);
        return url;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return p;
}

// Start recording the first two parts in the background.
export function prefetchStoryVoice(text: string, voice = DEFAULT_VOICE, language = "bg") {
  const parts = splitForVoice(text);
  // Part 0 first: the server charges the story on it, the rest rides along.
  groupId(text).then((g) => fetchPart(parts[0], voice, language, g, 0)
    .then(() => parts[1] && fetchPart(parts[1], voice, language, g, 1))
    .catch(() => {}));
}

function durationOf(url: string): Promise<number> {
  return new Promise((resolve) => {
    const a = new Audio();
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => resolve(0);
    a.src = url;
  });
}

export function useStoryVoice(text: string, voice: string, language: string) {
  const parts = useRef<string[]>([]);
  const urls = useRef<(string | null)[]>([]);
  const durs = useRef<number[]>([]);
  const idx = useRef(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [ready, setReady] = useState(0);
  const [total, setTotal] = useState(0);
  const [played, setPlayed] = useState(0);
  const [recordedSec, setRecordedSec] = useState(0);
  const [voiceName, setVoiceName] = useState<string | null>(null);
  const [lens, setLens] = useState<number[]>([]);
  const statusRef = useRef<VoiceStatus>("idle");
  useEffect(() => { statusRef.current = status; }, [status]);

  // A new story or voice starts over.
  useEffect(() => {
    started.current = false;
    parts.current = splitForVoice(text);
    urls.current = parts.current.map(() => null);
    durs.current = parts.current.map(() => 0);
    idx.current = 0;
    setTotal(parts.current.length);
    setLens(parts.current.map((p) => p.length));
    setReady(0);
    setPlayed(0);
    setRecordedSec(0);
    setStatus("idle");
    const stop = () => {
      const a = audio.current;
      if (!a) return;
      a.onended = null;
      a.ontimeupdate = null;
      a.pause();
    };
    stop();
    // Leaving the story (a new one, the library, home) stops the voice.
    return stop;
  }, [text, voice, language]);

  const el = () => (audio.current ??= new Audio());

  const playIndex = useCallback((i: number) => {
    const a = el();
    const url = urls.current[i];
    idx.current = i;
    if (!url) { setStatus("buffering"); return; }
    a.src = url;
    a.onended = () => {
      if (idx.current + 1 < parts.current.length) playIndex(idx.current + 1);
      else { setStatus("ended"); idx.current = 0; }
    };
    a.ontimeupdate = () => {
      const before = durs.current.slice(0, idx.current).reduce((s, d) => s + d, 0);
      setPlayed(before + a.currentTime);
    };
    a.play().then(() => setStatus("playing")).catch(() => setStatus("paused"));
  }, []);

  const record = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    const g = await groupId(text);
    // Part 0 alone first (it charges the story and decides the voice), then
    // the others two at a time.
    let next = 0;
    const one = async (i: number) => {
      const url = await fetchPart(parts.current[i], voice, language, g, i);
      urls.current[i] = url;
      if (i === 0) setVoiceName(narrator.get(url) ?? null);
      durs.current[i] = await durationOf(url);
      setReady((n) => n + 1);
      setRecordedSec(durs.current.reduce((s, d) => s + d, 0));
      // The listener was waiting for exactly this part.
      if (idx.current === i && (statusRef.current === "buffering" || statusRef.current === "preparing")) playIndex(i);
    };
    try { await one(0); next = 1; } catch { setStatus("error"); return; }
    const worker = async () => {
      while (next < parts.current.length) {
        const i = next++;
        try { await one(i); } catch { return; }
      }
    };
    await Promise.all([worker(), worker()]);
  }, [text, voice, language, playIndex]);

  const toggle = useCallback(() => {
    const a = el();
    if (status === "playing") { a.pause(); setStatus("paused"); return; }
    if (status === "paused") { a.play().then(() => setStatus("playing")).catch(() => {}); return; }
    // First tap: unlock audio inside the tap (iOS), then play or wait.
    a.src = SILENCE;
    a.play().catch(() => {});
    if (status === "ended") { playIndex(0); return; }
    if (urls.current[0]) playIndex(0);
    else setStatus("preparing");
    record();
  }, [status, playIndex, record]);

  // Estimated length: what is recorded so far, plus the rest at the same pace.
  const recordedChars = lens.slice(0, ready).reduce((s, n) => s + n, 0);
  const allChars = lens.reduce((s, n) => s + n, 0);
  const estTotal = recordedChars > 0 ? (recordedSec / recordedChars) * allChars : allChars * 0.075;

  // voiceName: set when the server picked a fixed narrator (subscribers).
  return { status, toggle, ready, total, played, recordedSec, estTotal, record, voiceName };
}

import { NextRequest, NextResponse } from "next/server";
import { saveAudioToStorage } from "@/lib/supabase";

// TEMPORARY, preview only: does Gemini TTS follow stress marks?
// GET ?v=plain|acute|grave|acute-hint|grave-hint → WAV saved under story-audio/lab/.
export const maxDuration = 60;

const BASE = "Драконът кацна до пещерата. Мая погали дракона и драконите заспаха.";
const ACUTE = "Дра́конът кацна до пещера́та. Мая погали дра́кона и дра́коните заспаха.";
const GRAVE = "Дра̀конът кацна до пещера̀та. Мая погали дра̀кона и дра̀коните заспаха.";
const HINT = "Прочети на български. Знакът над гласна показва ударената сричка, спазвай го точно: ";

function pcmToWav(pcm: Uint8Array, rate: number): ArrayBuffer {
  const buf = new ArrayBuffer(44 + pcm.length);
  const dv = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); dv.setUint32(4, 36 + pcm.length, true); w(8, "WAVE"); w(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  w(36, "data"); dv.setUint32(40, pcm.length, true);
  new Uint8Array(buf, 44).set(pcm);
  return buf;
}

export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const v = req.nextUrl.searchParams.get("v") || "plain";
  const text = { plain: BASE, acute: ACUTE, grave: GRAVE, "acute-hint": HINT + ACUTE, "grave-hint": HINT + GRAVE }[v];
  if (!text) return NextResponse.json({ error: "bad v" }, { status: 400 });
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Schedar" } } } },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: res.status, detail: (await res.text()).slice(0, 300) }, { status: 502 });
  const part = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) return NextResponse.json({ error: "no audio" }, { status: 502 });
  const rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
  const wav = pcmToWav(new Uint8Array(Buffer.from(part.data, "base64")), rate);
  const url = await saveAudioToStorage(`lab-stress-${v}.wav`, wav);
  return NextResponse.json({ v, url });
}

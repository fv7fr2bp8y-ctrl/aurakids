import { NextResponse } from "next/server";
import { addStress } from "@/lib/stress";
import { saveAudioToStorage } from "@/lib/supabase";

// TEMPORARY, preview only: the excerpt recorded the way the fixed /api/tts
// does it (dictionary stress, pieces of up to 260 characters, 3 at a time).
export const maxDuration = 180;

const TEXT = "Мая и драконът, който плачеше със сажди.\n\nКамъкът под краката на Мая се търколи надолу и изтрополи по стръмната пътека, а тя се притисна към студената скала на Пепелявата планина. Долу, в селото, звънците биеха тревожно — драконът отново беше минал оттам и беше опърлил покрива на хамбара. „Чудовище! Злодей!\" викаха хората и размахваха вили. Но Мая, която беше само на пет години и половина, беше видяла нещо, което никой друг не забеляза: когато драконът прелетя над комините, от очите му капнаха две едри черни капки, тежки като въглен, и оставиха две димящи дупки в снега.\n\n— Не мисля, че е злодей — прошепна Мая. — Мисля, че му е мъчно.\n\nНа рамото ѝ седеше един дебел сив гълъб на име Мърморко, който се беше самопоканил за спътник още от сутринта и оттогава не млъкваше.";

function chunkText(text: string, maxLen: number): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur.length + s.length > maxLen && cur) { chunks.push(cur.trim()); cur = ""; }
    cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

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

async function say(text: string, key: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Schedar" } } } } }),
    });
    if (res.status === 429) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
    const part = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (part?.data) return part;
  }
  throw new Error("no audio");
}

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  const chunks = chunkText(addStress(TEXT), 260);
  const parts: Uint8Array[] = new Array(chunks.length);
  let rate = 24000, next = 0;
  const t0 = Date.now();
  try {
    const worker = async () => {
      while (next < chunks.length) {
        const i = next++;
        const p = await say(chunks[i], key);
        rate = parseInt((p.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
        parts[i] = new Uint8Array(Buffer.from(p.data, "base64"));
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const pcm = new Uint8Array(total); let off = 0;
  for (const p of parts) { pcm.set(p, off); off += p.length; }
  const url = await saveAudioToStorage(`lab-otkas-kratki.wav`, pcmToWav(pcm, rate));
  return NextResponse.json({ url, chunks: chunks.length, seconds: Math.round((Date.now() - t0) / 1000), sample: chunks.slice(0, 2) });
}

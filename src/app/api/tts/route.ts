import { NextRequest, NextResponse } from "next/server";
import { requireSameOrigin } from "@/lib/originCheck";
import { takeQuota, quotaDenied, takeElevenLabs, type QuotaResult } from "@/lib/quota";
import { addStress } from "@/lib/stress";
import { createHash } from "crypto";
import { getCachedAudio, saveAudioToStorage } from "@/lib/supabase";

export const maxDuration = 180;

// Newest first — 3.1 is the most reliable; 2.5 as fallback.
const GEMINI_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];
const GEMINI_DEFAULT_VOICE = "Schedar";
const GEMINI_VOICES = new Set(["Schedar", "Kore", "Aoede", "Charon", "Puck", "Leda"]);

// Google Cloud Text-to-Speech — Chirp3-HD voices per language.
const LOCALES: Record<string, string> = {
  bg: "bg-BG", en: "en-US", de: "de-DE", fr: "fr-FR", ru: "ru-RU",
};
const GTTS_SUFFIX: Record<string, string> = {
  Schedar: "Aoede", Kore: "Kore", Aoede: "Leda", Leda: "Zephyr", Charon: "Charon", Puck: "Puck",
};

async function callGoogleTTSOAuth(text: string, token: string, voiceName: string, locale: string): Promise<ArrayBuffer | null> {
  const attempt = async (name: string) => {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: locale, name },
        audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
      }),
    });
    if (!res.ok) {
      console.error("Google TTS error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const b64 = (await res.json())?.audioContent;
    if (!b64) return null;
    const buf = Buffer.from(b64, "base64");
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  };
  // Try Chirp3-HD; if the voice isn't available, fall back to Standard.
  return (await attempt(voiceName)) ?? (await attempt(`${locale}-Standard-A`));
}

// ElevenLabs v3 (like ONIRA) for paying families only, see takeElevenLabs().
// ELEVENLABS_VOICE_ID picks the narrator; otherwise the friendly voice id maps
// to one of ElevenLabs' premade voices below.
const EL_MODEL = "eleven_v3";
const EL_MAX = 4500; // v3 takes up to 5000 characters per request
const EL_VOICE_MAP: Record<string, string> = {
  Schedar: "EXAVITQu4vr4xnSDxMaL", // Sarah — warm female
  Kore: "pFZP5JQG7iQjIQuC4Bku",    // Lily — clear female
  Aoede: "XB0fDUnXU5powFXDhCwa",   // Charlotte — soft
  Leda: "cgSgspJ2msm6clMCkdW9",    // Jessica — young
  Charon: "onwK4e9ZLuTAKqWW03F9",  // Daniel — deep male
  Puck: "TX3LPaxmHKxFdv7VOQHJ",    // Liam — playful male
};
const EL_DEFAULT = "EXAVITQu4vr4xnSDxMaL";

function fileName(text: string, voice: string, provider: string, ext: string) {
  return createHash("sha1").update(`${provider}|${voice}|${text}`).digest("hex") + "." + ext;
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

async function callElevenLabs(text: string, key: string, voiceId: string): Promise<ArrayBuffer | null> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: EL_MODEL,
      language_code: "bg",
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) {
    console.error("ElevenLabs error:", res.status, await res.text().catch(() => ""));
    return null;
  }
  return res.arrayBuffer();
}

async function callGemini(text: string, key: string, voice: string) {
  // Try each model until one returns audio (preview models occasionally answer
  // with finishReason OTHER and no audio; the next model usually succeeds).
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
          }),
        }
      );
      // Rate limit: wait a little and try the same model again.
      if (res.status === 429) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
      if (!res.ok) break;
      const part = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (part?.data) return part;
      break;
    } catch { break; /* try next model */ }
  }
  return null;
}

// Self-check: which TTS providers are configured (booleans only, no secrets).
export async function GET() {
  return NextResponse.json({
    googleCloudTTS: !!process.env.GOOGLE_TTS_ACCESS_TOKEN,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    gemini: !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
  });
}

export async function POST(req: NextRequest) {
  const denied = requireSameOrigin(req);
  if (denied) return denied;
  const { text, voice, language } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Липсва текст" }, { status: 400 });
  }
  const trimmed = text.trim();
  // A full bedtime story is ~3–5k characters; anything far longer is not ours.
  if (trimmed.length > 9000) {
    return NextResponse.json({ error: "Текстът е твърде дълъг" }, { status: 413 });
  }

  // One quota unit per request, taken only when audio really has to be made
  // (cache hits stay free).
  let quota: QuotaResult | null = null;
  const reserve = async () => (quota ??= await takeQuota(req, "tts"));

  const elKey = process.env.ELEVENLABS_API_KEY;
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  // Google Cloud TTS (Chirp3-HD) needs OAuth — a plain API key gets 401. Only
  // use it when a bearer access token is explicitly provided.
  const gttsToken = process.env.GOOGLE_TTS_ACCESS_TOKEN;

  // ---------- Preferred (only if OAuth token present): Google Cloud TTS ----------
  const locale = LOCALES[language] || "bg-BG";
  if (gttsToken) {
    const voiceName = `${locale}-Chirp3-HD-${GTTS_SUFFIX[voice] || "Aoede"}`;
    const fn = fileName(trimmed, voiceName, "gtts", "mp3");

    const cachedUrl = await getCachedAudio(fn);
    if (cachedUrl) {
      const audio = await (await fetch(cachedUrl)).arrayBuffer();
      return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }

    const q = await reserve();
    if (!q.ok) return quotaDenied(q);
    let mp3 = await callGoogleTTSOAuth(trimmed, gttsToken, voiceName, locale);
    if (!mp3) mp3 = await callGoogleTTSOAuth(trimmed, gttsToken, voiceName, locale);
    if (mp3) {
      await saveAudioToStorage(fn, mp3);
      return new NextResponse(mp3, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }
    // fall through if Google TTS failed
  }

  // ---------- ElevenLabs (paying families, within their monthly allowance) ----------
  if (elKey && (language || "bg") === "bg") {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || EL_VOICE_MAP[voice] || EL_DEFAULT;
    const fn = fileName(trimmed, voiceId, "el3", "mp3");

    const cachedUrl = await getCachedAudio(fn);
    if (cachedUrl) {
      const audio = await (await fetch(cachedUrl)).arrayBuffer();
      return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }

    const allowance = await takeElevenLabs(req);
    if (allowance) {
      const q = await reserve();
      if (!q.ok) { await allowance.refund().catch(() => {}); return quotaDenied(q); }
      // Only the dictionary layers ElevenLabs needs (names/rare words); the
      // text is cut between paragraphs when over the v3 request limit.
      const parts = splitParagraphs(addStress(trimmed, {}, { wiki: false }), EL_MAX);
      const out: ArrayBuffer[] = [];
      for (const part of parts) {
        const mp3 = (await callElevenLabs(part, elKey, voiceId)) ?? (await callElevenLabs(part, elKey, voiceId));
        if (!mp3) break;
        out.push(mp3);
      }
      if (out.length === parts.length) {
        const total = out.reduce((n, b) => n + b.byteLength, 0);
        const joined = new Uint8Array(total);
        let off = 0;
        for (const b of out) { joined.set(new Uint8Array(b), off); off += b.byteLength; }
        await saveAudioToStorage(fn, joined.buffer);
        return new NextResponse(joined.buffer, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
      }
      await allowance.refund().catch(() => {});
      // fall through to Gemini if ElevenLabs failed
    }
  }

  // ---------- Fallback: Gemini ----------
  if (!geminiKey) {
    return NextResponse.json({ error: "TTS не е конфигуриран" }, { status: 503 });
  }
  const gVoice = GEMINI_VOICES.has(voice) ? voice : GEMINI_DEFAULT_VOICE;
  const fn = fileName(trimmed, gVoice, "gemini", "wav");

  const cachedUrl = await getCachedAudio(fn);
  if (cachedUrl) {
    const wavBuffer = await (await fetch(cachedUrl)).arrayBuffer();
    return new NextResponse(wavBuffer, { headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=86400" } });
  }

  // The Gemini preview TTS chokes on long input (returns no audio), so read the
  // story in sentence-sized chunks and stitch the PCM into one WAV.
  const q = await reserve();
  if (!q.ok) return quotaDenied(q);
  // Short pieces (one or two sentences): in long requests Gemini skipped the
  // stress marks ("драконът" read wrong despite "дра́конът", 23.11.2026), in
  // single sentences it kept them. 3 pieces are recorded at a time.
  const chunks = chunkText(addStress(trimmed), 260);
  const pcmParts: Uint8Array[] = new Array(chunks.length);
  let rate = 24000;
  let failed = false;
  let next = 0;
  const worker = async () => {
    while (!failed && next < chunks.length) {
      const i = next++;
      let part = await callGemini(chunks[i], geminiKey, gVoice);
      if (!part) part = await callGemini(chunks[i], geminiKey, gVoice);
      if (!part?.data) { failed = true; return; }
      rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
      pcmParts[i] = new Uint8Array(Buffer.from(part.data, "base64"));
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  if (failed) {
    await q.refund().catch(() => {});
    return NextResponse.json({ error: "Грешка при TTS" }, { status: 502 });
  }

  const total = pcmParts.reduce((n, p) => n + p.length, 0);
  const pcm = new Uint8Array(total);
  let off = 0;
  for (const p of pcmParts) { pcm.set(p, off); off += p.length; }
  const wav = pcmToWav(pcm, rate);
  await saveAudioToStorage(fn, wav);

  return new NextResponse(wav, { headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=86400" } });
}

// Split between paragraphs (then sentences) into pieces of at most maxLen.
function splitParagraphs(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const out: string[] = [];
  let cur = "";
  for (const p of text.split(/\n\s*\n/)) {
    if (cur && cur.length + p.length + 2 > maxLen) { out.push(cur); cur = ""; }
    if (p.length > maxLen) { out.push(...chunkText(p, maxLen)); continue; }
    cur = cur ? `${cur}\n\n${p}` : p;
  }
  if (cur) out.push(cur);
  return out;
}

// Split text into chunks up to ~maxLen chars, breaking on sentence ends.
function chunkText(text: string, maxLen: number): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur.length + s.length > maxLen && cur) { chunks.push(cur.trim()); cur = ""; }
    // a single sentence longer than maxLen: hard-split it
    if (s.length > maxLen) {
      for (let i = 0; i < s.length; i += maxLen) chunks.push(s.slice(i, i + maxLen).trim());
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

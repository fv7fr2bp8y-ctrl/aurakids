import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCachedAudio, saveAudioToStorage } from "@/lib/supabase";

export const maxDuration = 120;

const GEMINI_MODEL = "gemini-2.5-flash-preview-tts";
const GEMINI_DEFAULT_VOICE = "Schedar";
const GEMINI_VOICES = new Set(["Schedar", "Kore", "Aoede", "Charon", "Puck", "Leda"]);

// Google Cloud Text-to-Speech — Chirp3-HD Bulgarian voices (best pronunciation).
const GTTS_VOICE_MAP: Record<string, string> = {
  Schedar: "bg-BG-Chirp3-HD-Aoede",
  Kore: "bg-BG-Chirp3-HD-Kore",
  Aoede: "bg-BG-Chirp3-HD-Leda",
  Leda: "bg-BG-Chirp3-HD-Zephyr",
  Charon: "bg-BG-Chirp3-HD-Charon",
  Puck: "bg-BG-Chirp3-HD-Puck",
};
const GTTS_DEFAULT = "bg-BG-Chirp3-HD-Aoede";

async function callGoogleTTS(text: string, key: string, voiceName: string): Promise<ArrayBuffer | null> {
  const attempt = async (name: string) => {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "bg-BG", name },
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
  return (await attempt(voiceName)) ?? (await attempt("bg-BG-Standard-A"));
}

// ElevenLabs multilingual voices — best Bulgarian pronunciation.
// Maps our friendly voice ids to ElevenLabs voice IDs.
const EL_MODEL = "eleven_multilingual_v2";
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
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error("ElevenLabs error:", res.status, await res.text().catch(() => ""));
    return null;
  }
  return res.arrayBuffer();
}

async function callGemini(text: string, key: string, voice: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
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
  if (!res.ok) return null;
  const part = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  return part?.data ? part : null;
}

export async function POST(req: NextRequest) {
  const { text, voice } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Липсва текст" }, { status: 400 });
  }
  const trimmed = text.trim();

  const gttsKey = process.env.GOOGLE_API_KEY;
  const elKey = process.env.ELEVENLABS_API_KEY;
  const geminiKey = process.env.GOOGLE_API_KEY;

  // ---------- Preferred: Google Cloud TTS (Chirp3-HD Bulgarian) ----------
  if (gttsKey) {
    const voiceName = GTTS_VOICE_MAP[voice] || GTTS_DEFAULT;
    const fn = fileName(trimmed, voiceName, "gtts", "mp3");

    const cachedUrl = await getCachedAudio(fn);
    if (cachedUrl) {
      const audio = await (await fetch(cachedUrl)).arrayBuffer();
      return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }

    let mp3 = await callGoogleTTS(trimmed, gttsKey, voiceName);
    if (!mp3) mp3 = await callGoogleTTS(trimmed, gttsKey, voiceName);
    if (mp3) {
      await saveAudioToStorage(fn, mp3);
      return new NextResponse(mp3, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }
    // fall through if Google TTS failed
  }

  // ---------- ElevenLabs ----------
  if (elKey) {
    const voiceId = EL_VOICE_MAP[voice] || EL_DEFAULT;
    const fn = fileName(trimmed, voiceId, "el", "mp3");

    const cachedUrl = await getCachedAudio(fn);
    if (cachedUrl) {
      const audio = await (await fetch(cachedUrl)).arrayBuffer();
      return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }

    let mp3 = await callElevenLabs(trimmed, elKey, voiceId);
    if (!mp3) mp3 = await callElevenLabs(trimmed, elKey, voiceId);
    if (mp3) {
      await saveAudioToStorage(fn, mp3);
      return new NextResponse(mp3, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
    }
    // fall through to Gemini if ElevenLabs failed
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

  let part = await callGemini(trimmed, geminiKey, gVoice);
  if (!part) part = await callGemini(trimmed, geminiKey, gVoice);
  if (!part?.data) {
    return NextResponse.json({ error: "Грешка при TTS" }, { status: 502 });
  }

  const rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
  const pcm = new Uint8Array(Buffer.from(part.data, "base64"));
  const wav = pcmToWav(pcm, rate);
  await saveAudioToStorage(fn, wav);

  return new NextResponse(wav, { headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=86400" } });
}

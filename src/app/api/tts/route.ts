import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { getCachedAudio, saveAudioToStorage } from "@/lib/supabase";

export const maxDuration = 120;

const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Schedar";

const anthropic = new Anthropic();

// Adds Bulgarian stress marks (combining acute U+0301) so the TTS voice
// reads the correct syllable. Display text stays clean; this is voice-only.
async function accentForSpeech(text: string): Promise<string> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Постави знак за ударение върху ударената гласна на всяка многосрична българска дума, за да се прочете правилно от синтезатор на глас. Знакът е Unicode U+0301 (combining acute accent) — поставя се ВЕДНАГА след ударената гласна (напр. "геро́ят", "прика́зка", "Алекса́ндър").

ПРАВИЛА:
- НЕ променяй нито една буква, дума, пунктуация или ред — добавяй САМО знаци за ударение.
- Едносричните думи остават без знак.
- Спазвай книжовното българско ударение.
- Върни САМО текста с ударенията, без обяснения.

${text}`,
      }],
    });
    const block = msg.content[0];
    const out = block?.type === "text" ? block.text.trim() : "";
    // Sanity check: accented text should be roughly same length (only marks added)
    if (out && out.length >= text.length && out.length <= text.length * 1.6) return out;
    return text;
  } catch {
    return text;
  }
}

function textToFileName(text: string) {
  return createHash("sha1").update(`${VOICE}|${text}`).digest("hex") + ".wav";
}

function pcmToWav(pcm: Uint8Array, rate: number): ArrayBuffer {
  const buf = new ArrayBuffer(44 + pcm.length);
  const dv = new DataView(buf);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF"); dv.setUint32(4, 36 + pcm.length, true); w(8, "WAVE"); w(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  w(36, "data"); dv.setUint32(40, pcm.length, true);
  new Uint8Array(buf, 44).set(pcm);
  return buf;
}

async function callGemini(text: string, key: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    }
  );
  if (!res.ok) return null;
  const part = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  return part?.data ? part : null;
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "TTS не е конфигуриран" }, { status: 503 });
  }

  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Липсва текст" }, { status: 400 });
  }

  const fileName = textToFileName(text.trim());

  // Check Supabase storage cache — return redirect to public URL
  const cachedUrl = await getCachedAudio(fileName);
  if (cachedUrl) {
    const audioRes = await fetch(cachedUrl);
    const wavBuffer = await audioRes.arrayBuffer();
    return new NextResponse(wavBuffer, {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=86400" },
    });
  }

  // Add Bulgarian stress marks so the voice reads correct syllables
  const spoken = await accentForSpeech(text.trim());

  // Generate with Gemini
  let part = await callGemini(spoken, key);
  if (!part) part = await callGemini(spoken, key);
  if (!part?.data) {
    return NextResponse.json({ error: "Грешка при TTS" }, { status: 502 });
  }

  const rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
  const raw = Buffer.from(part.data, "base64");
  const pcm = new Uint8Array(raw);
  const wav = pcmToWav(pcm, rate);

  // Save to Supabase BEFORE returning
  await saveAudioToStorage(fileName, wav);

  return new NextResponse(wav, {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "public, max-age=86400" },
  });
}

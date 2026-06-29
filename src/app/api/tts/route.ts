import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Schedar";

function pcmToWav(pcm: Uint8Array, rate: number): Uint8Array {
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
  return new Uint8Array(buf);
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

  // Подаваме само чист текст — без стилови инструкции (вж. критични уроци)
  let part = await callGemini(text.trim(), key);
  if (!part) part = await callGemini(text.trim(), key); // един повторен опит
  if (!part?.data) {
    return NextResponse.json({ error: "Грешка при TTS" }, { status: 502 });
  }

  const rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || "24000", 10);
  const raw = Buffer.from(part.data, "base64");
  const pcm = new Uint8Array(raw);
  const wav = pcmToWav(pcm, rate);

  return new NextResponse(wav.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

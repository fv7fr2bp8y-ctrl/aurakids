import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
}

async function callGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.mimeType?.startsWith("image/"));
  return imgPart?.inlineData?.data ?? null;
}

async function generateImage(prompt: string): Promise<Buffer> {
  const styledPrompt = `Disney watercolor illustration, soft painterly brushstrokes, warm magical atmosphere, beautiful expressive characters, delicate watercolor washes, enchanting fairy-tale mood, ultra-detailed: ${prompt.slice(0, 800)}. No text, no watermarks, no letters.`;

  let b64 = await callGemini(styledPrompt);
  if (!b64) {
    await new Promise((r) => setTimeout(r, 3000));
    b64 = await callGemini(styledPrompt);
  }
  if (!b64) throw new Error("No image returned from Gemini");

  return Buffer.from(b64, "base64");
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Липсва prompt" }, { status: 400 });
  }

  const fileName = promptToFileName(prompt);

  const cached = await getCachedImage(fileName);
  if (cached) return NextResponse.json({ url: cached, fromCache: true });

  try {
    const imgBuffer = await generateImage(prompt);
    const arrayBuffer = imgBuffer.buffer.slice(imgBuffer.byteOffset, imgBuffer.byteOffset + imgBuffer.byteLength) as ArrayBuffer;
    const publicUrl = await saveImageToStorage(fileName, arrayBuffer);
    if (!publicUrl) throw new Error("Supabase upload failed");
    return NextResponse.json({ url: publicUrl, fromCache: false });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране на илюстрация" }, { status: 500 });
  }
}

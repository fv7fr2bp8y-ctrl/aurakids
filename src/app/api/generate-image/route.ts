import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
}

async function callGemini(prompt: string, key: string): Promise<string | null> {
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
    console.error("Gemini image error:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.mimeType?.startsWith("image/"));
  return imgPart?.inlineData?.data ?? null;
}

async function callOpenAI(prompt: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const client = new OpenAI();
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: "1024x1024",
      quality: "medium",
    });
    return "data" in response ? response.data?.[0]?.b64_json ?? null : null;
  } catch (e) {
    console.error("OpenAI image error:", e);
    return null;
  }
}

async function generateImage(prompt: string): Promise<Buffer> {
  // Comic panels arrive pre-styled; everything else gets the watercolor house style.
  const isPreStyled = /comic book panel/i.test(prompt);
  const styledPrompt = isPreStyled
    ? prompt.slice(0, 1500)
    : `Disney watercolor illustration, soft painterly brushstrokes, warm magical atmosphere, beautiful expressive characters, delicate watercolor washes, enchanting fairy-tale mood, ultra-detailed: ${prompt.slice(0, 800)}. No text, no watermarks, no letters.`;

  // 1) Google Gemini
  const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (googleKey) {
    const b64 = await callGemini(styledPrompt, googleKey);
    if (b64) return Buffer.from(b64, "base64");
  }

  // 2) OpenAI gpt-image-1 fallback
  const b64 = await callOpenAI(styledPrompt);
  if (b64) return Buffer.from(b64, "base64");

  throw new Error("All image providers failed");
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

import { NextRequest, NextResponse } from "next/server";
import { requireSameOrigin } from "@/lib/originCheck";
import { takeQuota, quotaDenied } from "@/lib/quota";
import { createHash } from "crypto";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 120;

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
}

async function callGemini(prompt: string, key: string, aspect = "1:1"): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } },
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

async function callOpenAI(prompt: string, size: "1024x1024" | "1536x1024" = "1024x1024"): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const client = new OpenAI();
    const response = await client.images.generate({
      model: "gpt-image-2",
      prompt: prompt.slice(0, 4000),
      n: 1,
      size,
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
    : `Disney watercolor illustration, soft painterly brushstrokes, warm magical atmosphere, beautiful expressive characters, delicate watercolor washes, enchanting fairy-tale mood, ultra-detailed: ${prompt.slice(0, 1600)}. No text, no watermarks, no letters.`;

  const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  // Story pictures: wide (3:2) so the reader shows them uncropped, Gemini first
  // (~10 s, paid key since 23.11.2026) with OpenAI as fallback. Comic panels
  // stay square on OpenAI (best lettering and consistency).
  const providers = isPreStyled
    ? [() => callOpenAI(styledPrompt), () => (googleKey ? callGemini(styledPrompt, googleKey) : Promise.resolve(null))]
    : [() => (googleKey ? callGemini(styledPrompt, googleKey, "3:2") : Promise.resolve(null)), () => callOpenAI(styledPrompt, "1536x1024")];

  for (const call of providers) {
    const b64 = await call();
    if (b64) return Buffer.from(b64, "base64");
  }

  throw new Error("All image providers failed");
}

export async function POST(req: NextRequest) {
  const denied = requireSameOrigin(req);
  if (denied) return denied;
  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Липсва prompt" }, { status: 400 });
  }

  const fileName = promptToFileName(prompt);

  const cached = await getCachedImage(fileName);
  if (cached) return NextResponse.json({ url: cached, fromCache: true });

  const quota = await takeQuota(req, "image");
  if (!quota.ok) return quotaDenied(quota);

  try {
    const imgBuffer = await generateImage(prompt);
    const arrayBuffer = imgBuffer.buffer.slice(imgBuffer.byteOffset, imgBuffer.byteOffset + imgBuffer.byteLength) as ArrayBuffer;
    const publicUrl = await saveImageToStorage(fileName, arrayBuffer);
    if (!publicUrl) throw new Error("Supabase upload failed");
    return NextResponse.json({ url: publicUrl, fromCache: false });
  } catch (error) {
    console.error("Image generation error:", error);
    await quota.refund().catch(() => {});
    return NextResponse.json({ error: "Грешка при генериране на илюстрация" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
}

async function generateWithGemini(prompt: string): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const styledPrompt = `Children's book illustration, Pixar 3D style, vibrant jewel-tone colors, magical atmosphere, adorable characters with big expressive eyes, cinematic soft lighting, ultra-detailed: ${prompt.slice(0, 800)}. No text, no watermarks.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: styledPrompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Imagen error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
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
    const imgBuffer = await generateWithGemini(prompt);

    const arrayBuffer = imgBuffer.buffer.slice(
      imgBuffer.byteOffset,
      imgBuffer.byteOffset + imgBuffer.byteLength
    ) as ArrayBuffer;

    const publicUrl = await saveImageToStorage(fileName, arrayBuffer);
    if (!publicUrl) throw new Error("Supabase upload failed");

    return NextResponse.json({ url: publicUrl, fromCache: false });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране на илюстрация" }, { status: 500 });
  }
}

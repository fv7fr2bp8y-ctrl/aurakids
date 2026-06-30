import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";
import OpenAI from "openai";

export const maxDuration = 60;

const client = new OpenAI();

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
}

async function generateImage(prompt: string): Promise<Buffer> {
  const styledPrompt = `Disney watercolor illustration, soft painterly brushstrokes, warm magical atmosphere, beautiful expressive characters, delicate watercolor washes, enchanting fairy-tale mood, ultra-detailed: ${prompt.slice(0, 900)}. No text, no watermarks, no letters.`;

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: styledPrompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned from gpt-image-1");
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

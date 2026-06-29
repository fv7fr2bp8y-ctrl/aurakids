import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

function promptToFileName(prompt: string) {
  return createHash("sha1").update(prompt).digest("hex") + ".png";
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
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const styledPrompt = `Children's book illustration, Pixar 3D style, vibrant jewel-tone colors, magical atmosphere, adorable characters with big expressive eyes, cinematic soft lighting, ultra-detailed: ${prompt.slice(0, 800)}. No text, no watermarks.`;

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: styledPrompt,
      n: 1,
      size: "1024x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image from OpenAI");
    const arrayBuffer = Buffer.from(b64, "base64").buffer;

    const publicUrl = await saveImageToStorage(fileName, arrayBuffer);
    if (!publicUrl) throw new Error("Supabase upload failed");

    return NextResponse.json({ url: publicUrl, fromCache: false });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране на илюстрация" }, { status: 500 });
  }
}

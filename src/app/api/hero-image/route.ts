import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const HERO_FILE = "hero-main-v8.png";
const HERO_PROMPT =
  "Children's book illustration, Pixar 3D style: an adorable child with big expressive eyes and a tiny golden crown riding a friendly glowing purple dragon through a magical night sky. Fantasy kingdom below with glowing castles and thousands of twinkling stars. Rich purple, coral and gold colors. Cinematic lighting, ultra-detailed, no text, no watermarks.";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ url: null }, { status: 503 });

  const cached = await getCachedImage(HERO_FILE);
  if (cached) return NextResponse.json({ url: cached });

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: HERO_PROMPT,
      n: 1,
      size: "1536x1024",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ url: null });

    const arrayBuffer = Buffer.from(b64, "base64").buffer;
    const publicUrl = await saveImageToStorage(HERO_FILE, arrayBuffer);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

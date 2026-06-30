import { NextResponse } from "next/server";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";
import OpenAI from "openai";

export const maxDuration = 60;

const client = new OpenAI();

const HERO_FILE = "hero-dalle3-v1.png";
const HERO_PROMPT =
  "Disney watercolor illustration, soft painterly brushstrokes: an adorable young child with big expressive brown eyes and a tiny golden crown, riding a magnificent friendly purple dragon soaring through a magical twilight sky. The dragon has gentle eyes and iridescent lavender scales. Below: a glowing fantasy kingdom with tall castle spires, thousands of twinkling stars reflected in a silver river. Warm coral clouds, rich violet and gold watercolor washes, enchanting fairy-tale mood, cinematic wide composition, ultra-detailed, no text, no watermarks.";

export async function GET() {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ url: null }, { status: 503 });

  const cached = await getCachedImage(HERO_FILE);
  if (cached) return NextResponse.json({ url: cached });

  try {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: HERO_PROMPT,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ url: null });

    const buf = Buffer.from(b64, "base64");
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    const publicUrl = await saveImageToStorage(HERO_FILE, arrayBuffer);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

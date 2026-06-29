import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

const HERO_FILE = "hero-main.png";
const HERO_PROMPT =
  "A magical children's book hero illustration: a cute 5-year-old child with big bright eyes sitting on a giant open book floating in a dreamy night sky filled with glowing stars, golden sparkles, tiny fairies, and a friendly smiling moon. Warm purple and cream color palette. 3D Pixar-style render, ultra-detailed, soft lighting, whimsical and enchanting. Wide landscape format.";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ url: null }, { status: 503 });

  // Check Supabase cache
  const cached = await getCachedImage(HERO_FILE);
  if (cached) return NextResponse.json({ url: cached });

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: HERO_PROMPT,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid",
    });

    const dalleUrl = response.data?.[0]?.url;
    if (!dalleUrl) return NextResponse.json({ url: null });

    // Save to Supabase permanently BEFORE returning
    const publicUrl = await saveImageToStorage(HERO_FILE, dalleUrl);

    return NextResponse.json({ url: publicUrl ?? dalleUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const HERO_FILE = "hero-main-v4.png";
const HERO_PROMPT =
  "A breathtaking 3D Pixar-style children's book illustration: an adorable 5-year-old child hero with big expressive eyes and rosy cheeks, wearing a tiny golden crown, riding a friendly glowing purple dragon through a magical night sky. The dragon has soft iridescent scales, big kind eyes, and tiny wings with golden tips. Below them: a dreamy fantasy kingdom with glowing castle towers, floating islands, and thousands of twinkling stars. Warm magical light emanates from the child. Rich jewel-tone colors — deep purple, coral pink, golden yellow. Ultra-detailed 3D render, Pixar animation quality, cinematic lighting, wide landscape format, no text.";

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

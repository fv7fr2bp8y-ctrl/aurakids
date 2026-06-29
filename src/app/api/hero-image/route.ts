import { NextResponse } from "next/server";
import OpenAI from "openai";

// Cached URL in memory for the lifetime of the serverless instance
let cachedUrl: string | null = null;

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ url: null }, { status: 503 });

  if (cachedUrl) return NextResponse.json({ url: cachedUrl });

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt:
        "A magical children's book hero illustration: a cute 5-year-old child with big bright eyes sitting on a giant open book floating in a dreamy night sky filled with glowing stars, golden sparkles, tiny fairies, and a friendly smiling moon. Warm purple and cream color palette. 3D Pixar-style render, ultra-detailed, soft lighting, whimsical and enchanting. Wide landscape format.",
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid",
    });

    cachedUrl = response.data?.[0]?.url ?? null;
    return NextResponse.json({ url: cachedUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

import { NextResponse } from "next/server";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const HERO_FILE = "hero-main-v7.png";
const HERO_PROMPT =
  "Children's book illustration, Pixar 3D style, vibrant jewel-tone colors, magical atmosphere: an adorable child with big expressive eyes and a tiny golden crown riding a friendly glowing purple dragon through a magical night sky. Fantasy kingdom below with glowing castles and thousands of twinkling stars. Rich purple, coral and gold colors. Cinematic lighting, ultra-detailed, no text, no watermarks.";

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ url: null }, { status: 503 });

  const cached = await getCachedImage(HERO_FILE);
  if (cached) return NextResponse.json({ url: cached });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: HERO_PROMPT }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini Imagen error:", res.status, err);
      return NextResponse.json({ url: null }, { status: 500 });
    }

    const data = await res.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return NextResponse.json({ url: null }, { status: 500 });

    const arrayBuffer = Buffer.from(b64, "base64").buffer;
    const publicUrl = await saveImageToStorage(HERO_FILE, arrayBuffer);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

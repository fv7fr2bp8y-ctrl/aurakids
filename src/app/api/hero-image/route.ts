import { NextResponse } from "next/server";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const HERO_FILE = "hero-main-v11.png";
const HERO_PROMPT =
  "Disney watercolor illustration, soft painterly brushstrokes: an adorable young child with big expressive brown eyes and a tiny golden crown, riding a magnificent friendly purple dragon soaring through a magical twilight sky. The dragon has gentle eyes and iridescent lavender scales. Below: a glowing fantasy kingdom with tall castle spires, thousands of twinkling stars reflected in a silver river. Warm coral clouds, rich violet and gold watercolor washes, enchanting fairy-tale mood, cinematic wide composition, ultra-detailed, no text, no watermarks.";

export async function GET() {
  const key = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ url: null }, { status: 503 });

  const cached = await getCachedImage(HERO_FILE);
  if (cached) return NextResponse.json({ url: cached });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: HERO_PROMPT }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini error:", res.status, err);
      return NextResponse.json({ url: null });
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: { inlineData?: { mimeType?: string; data?: string } }) => p.inlineData?.mimeType?.startsWith("image/"));
    const b64 = imgPart?.inlineData?.data;
    if (!b64) return NextResponse.json({ url: null });

    const arrayBuffer = Buffer.from(b64, "base64").buffer;
    const publicUrl = await saveImageToStorage(HERO_FILE, arrayBuffer);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Hero image error:", error);
    return NextResponse.json({ url: null });
  }
}

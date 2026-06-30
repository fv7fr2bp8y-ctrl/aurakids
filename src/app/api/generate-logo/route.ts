import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const client = new OpenAI();

const LOGO_CONCEPTS = [
  {
    id: "portal-world",
    prompt: "Minimalist logo icon, pure white background, centered: a perfect circle portal made of swirling purple and gold light, inside the portal a tiny magical fantasy kingdom with a castle and stars visible, as if looking through a magical window into another world, the portal ring glows with iridescent aurora colors, ultra clean modern design, no text, no letters",
  },
  {
    id: "child-constellation",
    prompt: "Minimalist logo icon, pure white background, centered: a small child silhouette sitting and reading, their body and the open book composed entirely of connected golden stars and constellation lines, the stars glow warmly against deep purple space, magical and poetic, clean modern design, no text, no letters",
  },
  {
    id: "dragon-spiral",
    prompt: "Minimalist logo icon, pure white background, centered: a small friendly dragon coiled into a perfect spiral shape, its tail curling into the center like a galaxy, scales are iridescent purple and teal, a single golden star at the center of the spiral, sleek modern design with soft rounded lines, no text, no letters",
  },
  {
    id: "dream-bubble",
    prompt: "Minimalist logo icon, pure white background, centered: a sleeping child's profile as a simple elegant silhouette, above their head a large glowing dream bubble containing a tiny dragon flying over a castle with stars, the bubble outline shimmers with soft purple and gold gradient, dreamy and tender, modern clean icon design, no text, no letters",
  },
];

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const concept = LOGO_CONCEPTS.find((c) => c.id === id);
  if (!concept) {
    return NextResponse.json({ concepts: LOGO_CONCEPTS.map((c) => c.id) });
  }

  const fileName = `logo-concept-${concept.id}-v1.png`;
  const cached = await getCachedImage(fileName);
  if (cached) return NextResponse.json({ url: cached, fromCache: true });

  try {
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: concept.prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "No image" }, { status: 500 });

    const buf = Buffer.from(b64, "base64");
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    const url = await saveImageToStorage(fileName, arrayBuffer);
    return NextResponse.json({ url, fromCache: false });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

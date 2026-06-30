import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCachedImage, saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 60;

const client = new OpenAI();

const LOGO_CONCEPTS = [
  {
    id: "book-star",
    prompt: "Minimalist logo design, transparent background, centered composition: an open magical storybook with golden pages, a glowing five-pointed star rising from the center of the book, deep purple and gold color palette, elegant and modern, suitable for a children's app, clean vector-style illustration, no text, no letters, no background",
  },
  {
    id: "dragon-crown",
    prompt: "Minimalist logo design, transparent background, centered composition: a friendly cute small dragon curled around a golden crown, purple and coral gradient colors, whimsical fairy-tale style, clean modern icon suitable for a children's app, soft rounded shapes, no text, no letters, no background",
  },
  {
    id: "magic-quill",
    prompt: "Minimalist logo design, transparent background, centered composition: a glowing magical golden feather quill pen with sparkling stars and magic dust trailing from its tip, deep purple and gold colors, elegant modern icon for a children's storytelling app, clean vector style, no text, no letters, no background",
  },
  {
    id: "moon-book",
    prompt: "Minimalist logo design, transparent background, centered composition: a crescent moon cradling a small open book with tiny stars scattered around, deep purple indigo and soft gold colors, dreamy and magical, modern clean icon for a children's bedtime story app, rounded soft shapes, no text, no letters, no background",
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

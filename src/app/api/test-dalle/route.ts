import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: "Disney watercolor illustration, a cute child riding a friendly purple dragon through a magical starry sky, soft painterly brushstrokes, no text",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const url = response.data?.[0]?.url;
    if (!url) return NextResponse.json({ error: "No image returned" });
    return NextResponse.json({ url, model: "dall-e-3", ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) });
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey: key });
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: "Disney watercolor illustration, a cute child riding a friendly purple dragon through a magical starry sky, soft painterly brushstrokes, no text",
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "No image returned", raw: response.data });
    const url = `data:image/png;base64,${b64.slice(0, 30)}...`;
    return NextResponse.json({ ok: true, model: "gpt-image-1", b64_length: b64.length, preview: url });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) });
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Image generation не е конфигуриран" }, { status: 503 });
  }

  const { prompt } = await req.json();
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Липсва prompt" }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: key });
    const styledPrompt = `Children's book illustration, watercolor and pastel style, soft and magical, warm lighting, age 3-8: ${prompt}`;

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: styledPrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid",
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error("Няма URL");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране на илюстрация" }, { status: 500 });
  }
}

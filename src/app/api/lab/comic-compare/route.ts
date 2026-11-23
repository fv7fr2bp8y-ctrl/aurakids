import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveImageToStorage } from "@/lib/supabase";

// TEMPORARY cost/quality comparison for comic pages. Works only on Vercel
// preview deployments (behind Vercel login), never in production.
// GET ?page=1|3&v=high|medium|low|gemini → renders one page, returns its URL.
export const maxDuration = 300;

const CHARACTER = "Maya, a 6-year-old girl with curly brown hair, a bright yellow raincoat and red rubber boots; her sidekick Pushko, a small grumpy round blue dragon with a tiny striped scarf.";
const STYLE = "photorealistic 3D render in the style of a modern Pixar animated film, cinematic lighting, rich detailed environments, expressive adorable characters, vibrant saturated colors";

const PAGES: Record<string, { title: string; panels: { scene: string; bubble: string }[] }> = {
  "1": {
    title: "Част 1: Тайната пътека",
    panels: [
      { scene: "Wide shot: Maya in her garden at dusk discovers glowing footprints leading into a hedge, Pushko hides behind her boot looking worried.", bubble: "ОХ!" },
      { scene: "Low angle: Maya pushes through the hedge, sparkles everywhere, Pushko sneezes a small puff of smoke.", bubble: "АПЧИХ!" },
      { scene: "Close-up: both stare at a giant door made of tree roots slowly opening with golden light.", bubble: "Лоша идея..." },
    ],
  },
  "3": {
    title: "Част 3: Голямото спасяване",
    panels: [
      { scene: "Epic splash: Maya rides on Pushko, who has suddenly grown huge, flying over a moonlit forest to catch a falling star, wind in her hair, dramatic perspective.", bubble: "ДРЪЖ СЕ!" },
    ],
  },
};

function buildPrompt(pageId: string) {
  const p = PAGES[pageId];
  const layout = p.panels.length === 1
    ? "A full-page splash: ONE single epic full-bleed panel filling the entire page, maximum drama and scale."
    : `${p.panels.length} panels arranged in a clean grid layout with white gutters between panels.`;
  const lines = p.panels.map((x, i) => `Panel ${i + 1}: ${x.scene} One large speech bubble with EXACTLY this text, spelled precisely letter-for-letter in a big bold clear font: "${x.bubble}". Every letter must be correct.`).join("\n");
  return `A full comic book page. ${layout}
Style: ${STYLE}.
The main character in every panel: ${CHARACTER} Exactly the same character design, outfit and colors in all panels.
At the top of the page: a parchment-style title banner with EXACTLY this text: "${p.title}" (render every letter precisely).
Speech bubbles are white with black outlines. All bubble text must be large and legible.

${lines}`;
}

let lastErr = "";
async function gemini(prompt: string, model = "gemini-2.5-flash-image"): Promise<string | null> {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) { lastErr = "no GOOGLE_API_KEY/GEMINI_API_KEY"; return null; }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "2:3" } },
    }),
  });
  if (!res.ok) { lastErr = `${res.status} ${(await res.text()).slice(0, 300)}`; return null; }
  const data = await res.json();
  if (!data?.candidates?.[0]?.content?.parts?.length) lastErr = JSON.stringify(data).slice(0, 300);
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((x: { inlineData?: { mimeType?: string; data?: string } }) => x.inlineData?.mimeType?.startsWith("image/"));
  return img?.inlineData?.data ?? null;
}

export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const page = req.nextUrl.searchParams.get("page") || "";
  const v = req.nextUrl.searchParams.get("v") || "";
  if (!PAGES[page] || !["high", "medium", "low", "gemini"].includes(v)) return NextResponse.json({ error: "bad params" }, { status: 400 });

  const prompt = buildPrompt(page);
  const t0 = Date.now();
  let b64: string | null = null;
  let usage: unknown = null;
  try {
    if (v === "gemini") b64 = await gemini(prompt, req.nextUrl.searchParams.get("m") || undefined);
    else {
      const r = await new OpenAI().images.generate({ model: "gpt-image-1", prompt, n: 1, size: "1024x1536", quality: v as "high" | "medium" | "low" });
      b64 = "data" in r ? r.data?.[0]?.b64_json ?? null : null;
      usage = (r as { usage?: unknown }).usage ?? null;
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
  if (!b64) return NextResponse.json({ error: "no image", detail: lastErr.replace(/key=[^&\s"]+/g, "key=…") }, { status: 502 });
  const buf = Buffer.from(b64, "base64");
  const url = await saveImageToStorage(`lab/comic-compare-p${page}-${v}.png`, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
  return NextResponse.json({ url, seconds: Math.round((Date.now() - t0) / 1000), bytes: buf.length, usage });
}

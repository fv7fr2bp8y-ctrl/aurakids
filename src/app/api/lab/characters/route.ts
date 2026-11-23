import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { saveImageToStorage } from "@/lib/supabase";

// TEMPORARY, preview only: character sheet + 3 scenes for the Maya story,
// drawn the way the site draws story pictures (gpt-image-2 medium).
export const maxDuration = 300;
const STORY = "Мая и драконът, който плачеше със сажди.\n\nКамъкът под краката на Мая се търколи надолу и изтрополи по стръмната пътека, а тя се притисна към студената скала на Пепелявата планина. Долу, в селото, звънците биеха тревожно — драконът отново беше минал оттам и беше опърлил покрива на хамбара. „Чудовище! Злодей!\" викаха хората и размахваха вили. Но Мая, която беше само на пет години и половина, беше видяла нещо, което никой друг не забеляза: когато драконът прелетя над комините, от очите му капнаха две едри черни капки, тежки като въглен, и оставиха две димящи дупки в снега.\n\n— Не мисля, че е злодей — прошепна Мая. — Мисля, че му е мъчно.\n\nНа рамото ѝ седеше един дебел сив гълъб на име Мърморко, който се беше самопоканил за спътник още от сутринта и оттогава не млъкваше.";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const msg = await new Anthropic().messages.create({
    model: "claude-opus-4-8", max_tokens: 1500,
    tools: [{ name: "save", description: "save", input_schema: { type: "object" as const, properties: {
      characters: { type: "string" }, imagePrompts: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } }, required: ["characters", "imagePrompts"] } }],
    tool_choice: { type: "tool", name: "save" },
    messages: [{ role: "user", content: `Приказка (началото): ${STORY}\n\nЗа characters: на английски, 2–3 изречения: как изглежда Мая (5 г.; възраст, коса, очи, дрехи, 1–2 запомнящи се белега) и как изглежда всеки спътник или същество на картинките (точен вид животно, цвят, размер, белег): гълъбът Мърморко и драконът. Бъди точен и последователен с текста.\n\nЗа image_prompts: три сцени на английски от РАЗЛИЧНИ моменти (начало: Мая и Мърморко по пътеката; среда: Мая при дракона в пещерата; край: Мая лети на гърба на дракона над селото), Disney watercolor style, soft brushstrokes, magical, no text. НЕ описвай външния вид на героите отново, наричай ги само по име.` }],
  });
  const tu = msg.content.find((b) => b.type === "tool_use");
  const inp = (tu && tu.type === "tool_use" ? tu.input : {}) as { characters: string; imagePrompts: string[] };
  const ai = new OpenAI();
  const urls = await Promise.all(inp.imagePrompts.map(async (p, i) => {
    const prompt = `Disney watercolor illustration, soft painterly brushstrokes, warm magical atmosphere, beautiful expressive characters, delicate watercolor washes, enchanting fairy-tale mood, ultra-detailed: Characters (draw them exactly like this in every picture): ${inp.characters} Scene: ${p}. No text, no watermarks, no letters.`;
    const r = await ai.images.generate({ model: "gpt-image-2", prompt, n: 1, size: "1024x1024", quality: "medium" });
    const b64 = "data" in r ? r.data?.[0]?.b64_json : undefined;
    if (!b64) return null;
    const buf = Buffer.from(b64, "base64");
    return saveImageToStorage(`lab/characters-${i + 1}.png`, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
  }));
  return NextResponse.json({ characters: inp.characters, scenes: inp.imagePrompts, urls });
}

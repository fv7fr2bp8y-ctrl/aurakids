import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createHash } from "crypto";
import { saveImageToStorage } from "@/lib/supabase";

export const maxDuration = 300;

const anthropic = new Anthropic();

const PLOTS = [
  "лудо преследване с неочакван съюзник — накрая гоненият се оказва приятел",
  "мисия да откраднеш обратно нещо откраднато, с хитър план, който се обърква смешно",
  "състезание срещу самохвалко — героят печели с ум, не със сила",
  "загадъчна карта води до съкровище, което не е това, което очакваш",
  "гигантско същество тероризира всички — а всъщност има малък, смешен проблем, който героят решава",
  "героят случайно става невидим/огромен/мъничък и трябва да оправи хаоса, който създава",
  "спасителна мисия срещу времето — нещо ще се случи на залез и героят трябва да успее",
  "двама съперници са принудени да работят заедно и стават най-добри приятели",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface PanelScript {
  scene: string;      // English scene description
  bubbles: string[];  // Bulgarian speech/caption texts to render inside the image
}

interface PageScript {
  pageTitle: string;      // Bulgarian, e.g. "Част 1: Тайната пътека"
  pageText: string;       // Bulgarian narration shown under the page (HTML, always correct)
  panels: PanelScript[];  // 3 panels per page
}

async function generatePage(page: PageScript, characterDesc: string, pageNum: number): Promise<string | null> {
  const panelLines = page.panels
    .map((p, i) => {
      const bubbles = p.bubbles.length && p.bubbles[0]
        ? ` One large speech bubble with EXACTLY this Bulgarian text, spelled precisely letter-for-letter in a big bold clear font: "${p.bubbles[0]}". Every Cyrillic letter must be correct.`
        : " No text and no speech bubbles in this panel.";
      return `Panel ${i + 1}: ${p.scene}${bubbles}`;
    })
    .join("\n");

  const prompt = `A full comic book page with ${page.panels.length} panels arranged in a clean grid layout with white gutters between panels.
Style: photorealistic 3D render in the style of a modern Pixar animated film, cinematic lighting, rich detailed environments, expressive adorable characters, vibrant saturated colors.
The main character in every panel: ${characterDesc} Exactly the same character design, outfit and colors in all panels.
At the top of the page: a parchment-style title banner with the Bulgarian text "${page.pageTitle}" (render the Cyrillic precisely).
Speech bubbles are white with black outlines; narration boxes are cream/parchment colored. All text inside bubbles must be in Bulgarian Cyrillic, large and legible.

${panelLines}`;

  const client = new OpenAI();
  try {
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: "1024x1536",
      quality: "high",
    });
    const b64 = "data" in response ? response.data?.[0]?.b64_json : undefined;
    if (!b64) return null;

    const buf = Buffer.from(b64, "base64");
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    const fileName = "comic-" + createHash("sha1").update(prompt).digest("hex").slice(0, 24) + `-p${pageNum}.png`;
    return await saveImageToStorage(fileName, arrayBuffer);
  } catch (e) {
    console.error("Comic page generation error:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { childName, theme, age } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const plot = pick(PLOTS);

    const scriptPrompt = `Ти си сценарист на детски комикси. Създай кратък, забавен комикс на български:

- Главен герой: ${childName}, на ${age}
- Свят: ${theme}
- Сюжет: ${plot}
- Точно 4 страници, всяка с 3 панела (общо 12 панела)
- Всеки панел: КИНЕМАТОГРАФИЧНО описание на сцената (на английски) — динамичен ъгъл, действие в движение, силна емоция. Мисли като режисьор на екшън: преследване, скок, изненада, падане, победа
- Всеки панел: ЕДНА кратка реплика за балон (на български, до 5 думи): "Насам, бързо!", "Това е невъзможно!", "Успяхме!" — или празно за чисто визуални моменти
- За всяка страница: pageText — разказ на български под страницата (3-4 изречения), който разказва тази част от историята живо и с хумор. Перфектна граматика, правилен род за героя
- Граматика: перфектен български, правилен род за ${childName}
- Ясна дъга: стр. 1 = завръзка и загадка; стр. 2 = проблемът се задълбочава; стр. 3 = голям обрат и кулминация; стр. 4 = развръзка и щастлив финал
- Заглавие на всяка страница: "Част 1: …" … "Част 4: …" — кратко и интригуващо

За characterDescription: опиши ${childName} на английски в 1 изречение (възраст, коса, дрехи, отличителен белег) — използва се ЕДНАКВО навсякъде.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      temperature: 1,
      tools: [{
        name: "save_comic",
        description: "Save the comic script",
        input_schema: {
          type: "object" as const,
          properties: {
            title: { type: "string", description: "Общо заглавие на комикса, съдържа името на героя" },
            characterDescription: { type: "string", description: "English, 1 sentence" },
            pages: {
              type: "array", minItems: 4, maxItems: 4,
              items: {
                type: "object",
                properties: {
                  pageTitle: { type: "string", description: "Български, напр. 'Част 1: Тайната пътека'" },
                  pageText: { type: "string", description: "Разказ на български под страницата, 3-4 изречения" },
                  panels: {
                    type: "array", minItems: 3, maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        scene: { type: "string", description: "English scene description" },
                        bubbles: { type: "array", items: { type: "string" }, description: "1-2 къси български текста за балони" },
                      },
                      required: ["scene", "bubbles"],
                    },
                  },
                },
                required: ["pageTitle", "pageText", "panels"],
              },
            },
          },
          required: ["title", "characterDescription", "pages"],
        },
      }],
      tool_choice: { type: "tool", name: "save_comic" },
      messages: [{ role: "user", content: scriptPrompt }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("Невалиден отговор");

    const script = toolUse.input as { title: string; characterDescription: string; pages: PageScript[] };

    // Render both pages in parallel with gpt-image-1
    const urls = await Promise.all(
      script.pages.map((page, i) => generatePage(page, script.characterDescription, i + 1))
    );

    const pages = script.pages
      .map((page, i) => ({ url: urls[i], text: page.pageText, pageTitle: page.pageTitle }))
      .filter((p): p is { url: string; text: string; pageTitle: string } => !!p.url);
    if (pages.length === 0) throw new Error("No pages rendered");

    return NextResponse.json({ title: script.title, pages });
  } catch (error) {
    console.error("Comic generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

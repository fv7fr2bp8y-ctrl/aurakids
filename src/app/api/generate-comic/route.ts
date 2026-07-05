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

const SIDEKICKS = [
  "предпазлив и мрънкащ спътник, който все казва 'това е ЛОША идея' — и все идва",
  "самоуверен дребосък с огромно его, който създава половината проблеми",
  "муден, вечно гладен спътник, който в решителния момент изненадва всички",
  "свръхентусиазиран новак, който разбира всичко буквално",
  "уж страшен на вид, а всъщност страхлив и мек спътник",
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

const ART_STYLES: Record<string, string> = {
  pixar: "photorealistic 3D render in the style of a modern Pixar animated film, cinematic lighting, rich detailed environments, expressive adorable characters, vibrant saturated colors",
  cartoon: "classic European cartoon comic style (Asterix / Spirou school): bold playful linework, exaggerated funny expressions and poses, bright flat colors with simple shading, lively chaotic energy, big noses and expressive silhouettes",
  manga: "colorful modern manga / anime style: large expressive eyes, dynamic speed lines and dramatic angles, cel-shaded vibrant colors, emotional close-ups, action-packed energy",
};

async function generatePage(page: PageScript, characterDesc: string, pageNum: number, artStyle: string): Promise<string | null> {
  const panelLines = page.panels
    .map((p, i) => {
      const bubbles = p.bubbles.length && p.bubbles[0]
        ? ` One large speech bubble with EXACTLY this text, spelled precisely letter-for-letter in a big bold clear font: "${p.bubbles[0]}". Every letter must be correct.`
        : " No text and no speech bubbles in this panel.";
      return `Panel ${i + 1}: ${p.scene}${bubbles}`;
    })
    .join("\n");

  const layout = page.panels.length === 1
    ? "A full-page splash: ONE single epic full-bleed panel filling the entire page, maximum drama and scale."
    : `${page.panels.length} panels arranged in a clean grid layout with white gutters between panels.`;
  const prompt = `A full comic book page. ${layout}
Style: ${ART_STYLES[artStyle] || ART_STYLES.pixar}.
The main character in every panel: ${characterDesc} Exactly the same character design, outfit and colors in all panels.
At the top of the page: a parchment-style title banner with EXACTLY this text: "${page.pageTitle}" (render every letter precisely).
Speech bubbles are white with black outlines; narration boxes are cream/parchment colored. All bubble text must be large and legible.

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
    const { childName, theme, age, language, artStyle } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const plot = pick(PLOTS);
    const sidekick = pick(SIDEKICKS);

    const LANG_NAMES: Record<string, string> = {
      bg: "български", en: "английски", de: "немски", fr: "френски", ru: "руски",
    };
    const langName = LANG_NAMES[language] || "български";

    const scriptPrompt = `Ти си сценарист на детски комикси. Създай кратък, забавен комикс. ВСИЧКИ текстове за читателя (заглавия, балони, pageText) са на ${langName}:

- Главен герой: ${childName}, на ${age}
- ЗАДЪЛЖИТЕЛНО ДУО: ${childName} има спътник с ПРОТИВОПОЛОЖЕН характер — ${sidekick}. Контрастът между двамата ражда хумора. Спътникът има смешно, просто име (истинска дума, не измислица)
- Свят: ${theme}
- Сюжет: ${plot}
- Точно 4 страници: стр. 1–2 и 4 имат по 3 панела; стр. 3 (КУЛМИНАЦИЯТА) е SPLASH — ЕДИН огромен епичен кадър на цяла страница
- Всеки панел: КИНЕМАТОГРАФИЧНО описание на сцената (на английски) — динамичен ъгъл, действие в движение, силна емоция. Мисли като режисьор на екшън
- Балони: предимно ОНОМАТОПЕЯ и възклицания — "БУМ!", "ФИУУ!", "ПЛЬОК!", "О, НЕ!" (1-3 думи). Максимум по 1 истинска кратка реплика на страница. Ономатопеята на езика на комикса
- ПОВТАРЯЩ СЕ ГЕГ: измисли една смешна подробност (навик на спътника, предмет, звук), която се появява на стр. 1, връща се на стр. 2 и НЕОЧАКВАНО спасява положението или гърми най-смешно на стр. 4
- Последният панел на стр. 1 и стр. 2: мини-клифхенгър — изненада или въпрос, който кара читателя да плъзне напред
- За всяка страница: pageText — разказ под страницата (3-4 изречения), жив и смешен. Перфектна граматика, правилен род за героя
- Възрастово темпо: за 2–5 г. — по-прости сцени, по-едри кадри, по-къс pageText (2 изречения); за 8+ — по-плътно действие и по-богат език
- Ясна дъга: стр. 1 = завръзка и загадка; стр. 2 = проблемът се задълбочава; стр. 3 = SPLASH кулминация; стр. 4 = развръзка + гегът гърми + щастлив финал
- Заглавие на всяка страница: "Част 1: …" … "Част 4: …" — кратко и интригуващо

За characterDescription: опиши на английски в 2 изречения: (1) ${childName} — възраст, коса, дрехи, 1-2 запомнящи се визуални маркера (напр. червен шал, раирана тениска); (2) спътника — вид, цвят, отличителен белег. Използва се ЕДНАКВО навсякъде.`;

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
                    type: "array", minItems: 1, maxItems: 3,
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
      script.pages.map((page, i) => generatePage(page, script.characterDescription, i + 1, artStyle || "pixar"))
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

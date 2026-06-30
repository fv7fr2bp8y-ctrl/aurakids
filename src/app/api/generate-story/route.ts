import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCachedStory, saveCachedStory } from "@/lib/supabase";

export const maxDuration = 120;

const client = new Anthropic();

function makeCacheKey(childName: string, theme: string, age: string) {
  return `story:${childName.toLowerCase().trim()}:${theme.toLowerCase()}:${age}`;
}

async function correctGrammar(story: string, childName: string): Promise<string> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages: [{
        role: "user",
        content: `Ти си коректор на български текст. Прегледай приказката и поправи САМО граматически грешки — род на главния герой (${childName}), членуване (-ът/-ят/-та/-то), пунктуация, книжовни форми. НЕ променяй съдържание, стил или структура. Върни САМО поправения текст, без обяснения, без коментари.

${story}`,
      }],
    });
    const text = msg.content[0];
    return text.type === "text" ? text.text.trim() : story;
  } catch {
    return story;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { childName, theme, themeName, age } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const cacheKey = makeCacheKey(childName, themeName || theme, age);

    const cached = await getCachedStory(cacheKey);
    if (cached) {
      return NextResponse.json({
        title: cached.title,
        story: cached.story,
        imagePrompts: cached.image_prompts,
        fromCache: true,
      });
    }

    const storyPrompt = `Ти си изключително талантлив детски писател. Пишеш на богат, красив, граматически безупречен съвременен български език.

ГРАМАТИКА — ЗАДЪЛЖИТЕЛНО:
- Определи сам граматическия род на ${childName} (момче или момиче) и го спазвай навсякъде
- Никога не бъркай "той/тя", "му/ѝ", "негов/неин"
- Членувай правилно: -ът/-ят за мъжки, -та за женски, -то за среден
- Книжовни форми: "взема" не "взима", "усеща" не "сеща"
- Запетая пред: "че", "който", "когато", "но", "а", "или"

Напиши вълшебна детска приказка:
- Главен герой: ${childName}, на ${age}
- Свят и тема: ${theme}
- Дължина: 7–9 параграфа (550–700 думи)
- ${childName} е активен герой — взема решения, проявява смелост, решава проблеми
- Структура: интригуващо начало → загадка → изпитание → кулминация → топъл край
- Тон: вълшебен, топъл, лек хумор
- Конкретни сетивни детайли — звуци, миризми, цветове
- Заглавие: поетично, съдържа ${childName}

За image_prompts: три сцени на английски, Disney watercolor style, soft brushstrokes, magical, ultra-detailed, no text.`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      tools: [{
        name: "save_story",
        description: "Save the generated story",
        input_schema: {
          type: "object" as const,
          properties: {
            title: { type: "string" },
            story: { type: "string", description: "Пълният текст, параграфите разделени с двоен нов ред" },
            imagePrompts: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          },
          required: ["title", "story", "imagePrompts"],
        },
      }],
      tool_choice: { type: "tool", name: "save_story" },
      messages: [{ role: "user", content: storyPrompt }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("Невалиден отговор от модела");

    const parsed = toolUse.input as { title: string; story: string; imagePrompts: string[] };

    // Grammar correction pass
    const correctedStory = await correctGrammar(parsed.story, childName);

    await saveCachedStory(cacheKey, parsed.title, correctedStory, parsed.imagePrompts || []);

    return NextResponse.json({
      title: parsed.title,
      story: correctedStory,
      imagePrompts: parsed.imagePrompts || [],
      fromCache: false,
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

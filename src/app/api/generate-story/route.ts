import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCachedStory, saveCachedStory } from "@/lib/supabase";

export const maxDuration = 60;

const client = new Anthropic();

function makeCacheKey(childName: string, theme: string, age: string) {
  return `story:${childName.toLowerCase().trim()}:${theme.toLowerCase()}:${age}`;
}

export async function POST(req: NextRequest) {
  try {
    const { childName, theme, themeName, age } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const cacheKey = makeCacheKey(childName, themeName || theme, age);

    // Check cache first
    const cached = await getCachedStory(cacheKey);
    if (cached) {
      return NextResponse.json({
        title: cached.title,
        story: cached.story,
        imagePrompts: cached.image_prompts,
        fromCache: true,
      });
    }

    const storyPrompt = `Ти си изключително талантлив детски писател с усет за магия, ритъм и емоция. Пишеш на богат, красив, съвременен български език.

Напиши вълшебна детска приказка:
- Главен герой: ${childName}, дете на ${age}
- Свят и тема: ${theme}
- Език: ИЗКЛЮЧИТЕЛНО на български — богат, топъл, образен
- Дължина: 7–9 параграфа (550–700 думи)
- ${childName} е активен герой — взима решения, проявява смелост, решава проблеми
- Структура: интригуващо начало → среща с приятел или загадка → изпитание → кулминация → топъл край с послание
- Тон: вълшебен и топъл, с лек хумор, без клиширан морал
- Конкретни сетивни детайли — звуци, миризми, цветове
- Заглавие: поетично, съдържа ${childName}

За image_prompts: три сцени на английски за DALL-E 3, Pixar 3D style, ultra-detailed, no text.`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      tools: [
        {
          name: "save_story",
          description: "Save the generated story with its title, text and image prompts",
          input_schema: {
            type: "object" as const,
            properties: {
              title: { type: "string", description: "Поетично заглавие на приказката, съдържащо името на детето" },
              story: { type: "string", description: "Пълният текст на приказката, параграфите разделени с двоен нов ред" },
              imagePrompts: {
                type: "array",
                items: { type: "string" },
                description: "Три описания на сцени за DALL-E 3 на английски",
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["title", "story", "imagePrompts"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "save_story" },
      messages: [{ role: "user", content: storyPrompt }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("Невалиден отговор от модела");

    const parsed = toolUse.input as { title: string; story: string; imagePrompts: string[] };

    // Save to cache BEFORE returning (critical on Vercel serverless)
    await saveCachedStory(cacheKey, parsed.title, parsed.story, parsed.imagePrompts || []);

    return NextResponse.json({
      title: parsed.title,
      story: parsed.story,
      imagePrompts: parsed.imagePrompts || [],
      fromCache: false,
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

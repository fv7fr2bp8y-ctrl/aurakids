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

    const prompt = `Ти си изключително талантлив детски писател с усет за магия, ритъм и емоция. Пишеш на богат, красив, съвременен български език.

Напиши вълшебна детска приказка по следните параметри:
- Главен герой: ${childName}, дете на ${age}
- Свят и тема: ${theme}
- Език: ИЗКЛЮЧИТЕЛНО на български — богат, топъл, образен
- Дължина: 7–9 параграфа (550–700 думи)
- ${childName} е активен герой — взима решения, проявява смелост, решава проблеми
- Структура: интригуващо начало → среща с приятел или загадка → изпитание → кулминация → топъл, надъхващ край с послание
- Тон: вълшебен и топъл, с хумор на места, без да е поучителен по клиширан начин
- Включи конкретни сетивни детайли — звуци, миризми, цветове — за да оживее светът
- Моралът трябва да произтича естествено от историята, не да е изречен директно
- Заглавието да е поетично и да съдържа името ${childName}

За илюстрациите — три сцени за AI image generator, описани на английски с богати визуални детайли, Pixar 3D animation style.

Отговори САМО с валиден JSON:
{
  "title": "Поетично заглавие с ${childName}",
  "story": "Пълният текст на приказката, параграфите разделени с \\n\\n",
  "imagePrompts": [
    "Scene 1: [opening scene, ultra-detailed, 3D Pixar style, rich colors, ${childName} as protagonist, no text]",
    "Scene 2: [climax scene, ultra-detailed, 3D Pixar style, dramatic lighting, no text]",
    "Scene 3: [happy ending scene, ultra-detailed, 3D Pixar style, warm golden light, no text]"
  ]
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Невалиден отговор");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Невалиден JSON");

    const parsed = JSON.parse(jsonMatch[0]);

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

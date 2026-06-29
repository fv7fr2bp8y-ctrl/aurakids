import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { childName, theme, themeName, age } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const prompt = `Ти си талантлив детски писател, който пише на красив български език.

Напиши вълшебна детска приказка с ТЕЗИ изисквания:
- Главен герой: ${childName} (дете на ${age})
- Тема: ${theme}
- Приказката трябва да е на БЪЛГАРСКИ ЕЗИК
- Дължина: 6-8 параграфа (около 400-500 думи)
- Стил: топъл, вълшебен, с морал накрая
- ${childName} трябва да е активен герой, не пасивен наблюдател
- Приказката трябва да е оригинална и завладяваща
- Включи магически елементи, приятели и предизвикателство, което ${childName} преодолява

ВАЖНО: Отговори САМО с JSON в точно този формат:
{
  "title": "Заглавие на приказката (включи ${childName})",
  "story": "Целият текст на приказката, параграфите разделени с \\n\\n",
  "imagePrompts": [
    "Описание на илюстрация 1 за началото на историята (на английски, за AI image generator)",
    "Описание на илюстрация 2 за кулминацията (на английски)",
    "Описание на илюстрация 3 за щастливия край (на английски)"
  ]
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Невалиден отговор");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Невалиден JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      title: parsed.title,
      story: parsed.story,
      imagePrompts: parsed.imagePrompts || [],
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const client = new Anthropic();

const PLOTS = [
  "спасяване на приятел от беда",
  "откриване на тайно място, което никой не е виждал",
  "състезание с неочакван край — печели хитростта",
  "среща със същество, което изглежда страшно, но е добро",
  "изгубено съкровище, което се оказва нещо съвсем различно",
  "малка пакост, която трябва да бъде поправена",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const { childName, theme, age } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const plot = pick(PLOTS);

    const prompt = `Ти си сценарист на детски комикси. Създай кратък, забавен комикс на български:

- Главен герой: ${childName}, на ${age}
- Свят: ${theme}
- Сюжет: ${plot}
- Точно 6 панела
- Всеки панел: кратко описание на сцената + реплика (пряка реч на героя/друг герой) ИЛИ разказвачески надпис
- Репликите: кратки, живи, детски, с хумор — както говорят истински деца
- Граматика: перфектен български, правилен род за ${childName}
- Второстепенни герои: истински имена или описания („старият бухал"), НИКАКВИ измислени безсмислици
- Ясна дъга: завръзка (1-2) → проблем (3) → опит (4) → обрат (5) → щастлив финал (6)

За characterDescription: опиши ${childName} на английски в 1 изречение (възраст, коса, дрехи, отличителен белег) — това описание се използва ЕДНАКВО във всички панели за визуална консистентност.

За всеки панел imagePrompt: сцената на английски, БЕЗ текст в картинката. Започвай с действието и емоцията.`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3000,
      temperature: 1,
      tools: [{
        name: "save_comic",
        description: "Save the generated comic",
        input_schema: {
          type: "object" as const,
          properties: {
            title: { type: "string", description: "Заглавие на комикса, съдържа името на героя" },
            characterDescription: { type: "string", description: "English, 1 sentence, consistent look of the hero" },
            panels: {
              type: "array",
              minItems: 6,
              maxItems: 6,
              items: {
                type: "object",
                properties: {
                  imagePrompt: { type: "string", description: "English scene description, no text in image" },
                  speech: { type: "string", description: "Реплика на герой (пряка реч) или празно" },
                  speaker: { type: "string", description: "Кой говори (име), или празно ако е разказвач" },
                  caption: { type: "string", description: "Разказвачески надпис, или празно ако има реплика" },
                },
                required: ["imagePrompt"],
              },
            },
          },
          required: ["title", "characterDescription", "panels"],
        },
      }],
      tool_choice: { type: "tool", name: "save_comic" },
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("Невалиден отговор");

    const parsed = toolUse.input as {
      title: string;
      characterDescription: string;
      panels: { imagePrompt: string; speech?: string; speaker?: string; caption?: string }[];
    };

    // Bake the consistent character into every panel prompt + comic style
    const styled = parsed.panels.map((p) => ({
      ...p,
      imagePrompt: `Comic book panel, vibrant children's comic style, bold clean outlines, bright saturated colors, dynamic composition: ${p.imagePrompt} The main character: ${parsed.characterDescription} Same character design in every panel. No text, no speech bubbles, no letters.`,
    }));

    return NextResponse.json({
      title: parsed.title,
      panels: styled,
      fromCache: false,
    });
  } catch (error) {
    console.error("Comic generation error:", error);
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

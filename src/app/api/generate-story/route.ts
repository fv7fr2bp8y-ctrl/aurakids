import { NextRequest, NextResponse, after } from "next/server";
import { requireSameOrigin } from "@/lib/originCheck";
import { takeQuota, quotaDenied } from "@/lib/quota";
import Anthropic from "@anthropic-ai/sdk";
import { saveCachedStory } from "@/lib/supabase";
import { addStress, stripStress } from "@/lib/stress";
import { verifiedStress, warmStress } from "@/lib/rechnik";

export const maxDuration = 120;

const client = new Anthropic();

function makeCacheKey(childName: string, theme: string, age: string) {
  return `story:${childName.toLowerCase().trim()}:${theme.toLowerCase()}:${age}:${Date.now()}`;
}

// ---- Variety engine: every story rolls a different combination ----

const ARCHETYPES = [
  "изгубено същество, което трябва да бъде върнато у дома",
  "загадка, която никой възрастен не забелязва — само детето",
  "приятел в беда, който има нужда точно от това дете",
  "състезание или изпитание с неочакван обрат — печели добротата, не силата",
  "малка грешка на героя, която трябва да бъде поправена с ум и смелост",
  "тайна врата/пътека, която се отваря само тази нощ",
  "същество, което всички се страхуват, а то всъщност е самотно",
  "изчезнало нещо ценно (звук, цвят, светлина), което героят връща на света",
];

const EMOTIONAL_CORES = [
  "смелостта не е да не те е страх, а да продължиш въпреки страха",
  "и най-малкият може да направи най-голямото добро",
  "истинският приятел се познава, когато е трудно",
  "да споделиш е по-сладко, отколкото да имаш всичко сам",
  "любопитството отваря врати, които силата не може",
  "да кажеш истината иска повече смелост от всяко приключение",
  "различният не е страшен — просто още не сте приятели",
  "търпението и малките стъпки местят планини",
];

const OPENINGS = [
  "започни по средата на действието — нещо вече се случва",
  "започни със странен звук или миризма, която събужда любопитството",
  "започни с диалог — някой казва нещо неочаквано",
  "започни с малка ежедневна случка, която внезапно става вълшебна",
  "започни с въпрос, който героят си задава",
];

const SIDEKICKS = [
  "говорещо животно с характер и забавен недостатък",
  "малко пакостливо вълшебно същество",
  "мъдър, но разсеян възрастен помощник",
  "неочакван съюзник — същество, което първо изглеждаше страшно",
  "без спътник — героят се справя сам, но среща различни герои по пътя",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  const denied = requireSameOrigin(req);
  if (denied) return denied;
  let refund: (() => Promise<void>) | null = null;
  try {
    const { childName, theme, themeName, age, language } = await req.json();

    if (!childName || !theme || !age) {
      return NextResponse.json({ error: "Липсват данни" }, { status: 400 });
    }

    const quota = await takeQuota(req, "story");
    if (!quota.ok) return quotaDenied(quota);
    refund = quota.refund;

    const archetype = pick(ARCHETYPES);
    const core = pick(EMOTIONAL_CORES);
    const opening = pick(OPENINGS);
    const sidekick = pick(SIDEKICKS);

    const LANG_NAMES: Record<string, string> = {
      bg: "български", en: "английски (English)", de: "немски (Deutsch)", fr: "френски (Français)", ru: "руски (Русский)",
    };
    const langName = LANG_NAMES[language] || "български";
    const langLine = language && language !== "bg"
      ? `\n\nЕЗИК: Напиши ЦЯЛАТА приказка (заглавие и текст) на ${langName}, с перфектна граматика и естествен, богат език на носител. Името ${childName} остава както е.`
      : "";

    const storyPrompt = `Ти си майстор-разказвач на детски приказки от ранга на Астрид Линдгрен и Валери Петров. Пишеш богато, живо и граматически безупречно.${langLine}

ГРАМАТИКА (за български) — ЗАДЪЛЖИТЕЛНО:
- Определи сам граматическия род на името „${childName}" (момче или момиче) и го спазвай в ЦЯЛАТА приказка — той/тя, му/ѝ, негов/неин, окончанията на прилагателните
- Членувай правилно: -ът/-ят (подлог, м.р.), -а/-я (допълнение, м.р.), -та (ж.р.), -то (ср.р.)
- Книжовни форми: „взема" не „взима", „видя" не „видя́л е" в неуместни времена
- Запетая пред: „че", „който/която/което", „когато", „но", „а", „защото"
- Прочети наум всяко изречение — ако звучи преведено или изкуствено, пренапиши го

ИМЕНА НА ВТОРОСТЕПЕННИ ГЕРОИ — МНОГО ВАЖНО:
- НИКАКВИ измислени безсмислени имена като „Лунолин", „Звездомир-Блясъчко", „Искрилия"
- Животни и вълшебни същества: истински думи с характер — Мърморко, Опашко, Съня, дядо Бухал, леля Мъглица — или изобщо без име („старата костенурка", „сребърната лисица")
- Хора: истински български имена (Драган, Невена, дядо Стоян, баба Злата)
- Едно добре избрано име е по-силно от пет измислени

ТАЗИ ПРИКАЗКА (следвай точно тези елементи — те я правят различна от всяка друга):
- Главен герой: ${childName}, на ${age}
- Свят: ${theme}
- Сюжетно ядро: ${archetype}
- Скрито послание (никога не го изричай директно, покажи го чрез действията): ${core}
- Начало: ${opening}
- Спътник: ${sidekick}

ЗАНАЯТ:
- Дължина: 7–9 параграфа (550–700 думи)
- ${childName} решава проблема САМ/САМА — чрез ум, доброта или смелост, не чрез магия, която просто се появява
- Поне два конкретни сетивни детайла на сцена: как мирише, как звучи, какво докосва
- Поне един момент на истинска трудност — нещо се обърква, героят се съмнява
- Лек хумор: една-две усмихващи подробности, не клоунада
- Краят: топъл, завършен, с тиха връзка към скритото послание — идеален за заспиване
- Заглавие: поетично и конкретно, съдържа ${childName}, НЕ шаблонно („X и вълшебното Y" е забранено)

За stress (ударения за гласа, който чете приказката): списък с думите от приказката, в които гласът лесно бърка ударението, всяка написана точно както е в текста, със знак за ударение U+0301 върху ударената гласна (напр. „Мъ́рморко“, „па́ра“, „замъ́ка“). Задължително: всички имена (и главният герой ${childName}) и всички редки, диалектни или двусмислени думи. До 40 думи. Ако не си сигурен за ударението на дума, не я включвай.

За characters: на английски, 2–3 изречения: как изглежда ${childName} (възраст, коса, очи, дрехи, 1–2 запомнящи се белега) и как изглежда всеки спътник или същество, което се появява на картинките (точен вид животно, цвят, размер, отличителен белег). Пример: "Maya, a 5-year-old girl with curly chestnut hair, brown eyes, a red knitted scarf and a navy coat. Murmorko, a plump round grey pigeon with a white neck ring." Това описание се слага дословно на всяка картинка, затова бъди точен и последователен с текста.

За image_prompts: три сцени на английски от РАЗЛИЧНИ моменти на историята (начало, кулминация, край), Disney watercolor style, soft brushstrokes, magical, ultra-detailed, no text. Опиши конкретната сцена с героя, не общи пейзажи. В сцените НЕ описвай външния вид на героите отново (той е в characters), наричай ги само по име или роля ("Maya", "the pigeon Murmorko").`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 3500,
      temperature: 1,
      tools: [{
        name: "save_story",
        description: "Save the generated story",
        input_schema: {
          type: "object" as const,
          properties: {
            title: { type: "string" },
            story: { type: "string", description: "Пълният текст, параграфите разделени с двоен нов ред" },
            stress: { type: "array", items: { type: "string" }, maxItems: 40, description: "Думи от текста със знак за ударение U+0301, напр. „Мъ́рморко“" },
            characters: { type: "string", description: "English: exact look of the hero and every companion that appears in the pictures" },
            imagePrompts: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          },
          required: ["title", "story", "characters", "imagePrompts"],
        },
      }],
      tool_choice: { type: "tool", name: "save_story" },
      messages: [{ role: "user", content: storyPrompt }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") throw new Error("Невалиден отговор от модела");

    const parsed = toolUse.input as { title: string; story: string; stress?: string[]; characters?: string; imagePrompts: string[] };
    // Every picture is drawn on its own, so the same character sheet goes into
    // each prompt (else the pigeon became a parrot in the next picture).
    const characters = (parsed.characters || "").trim().slice(0, 600);
    const imagePrompts = (parsed.imagePrompts || []).map((p) =>
      characters ? `Characters (draw them exactly like this in every picture): ${characters} Scene: ${p}` : p);
    // The reader sees the plain text; the voice gets the same text with stress
    // marks from the model's word list plus the shared ONIRA dictionary.
    const plainStory = stripStress(parsed.story);
    const plainTitle = stripStress(parsed.title);
    // Only dictionary-confirmed stress (rechnik.chitanka.info); the model just
    // points at the tricky words. Unknown words (most names) stay unmarked.
    const { marks: extra, missing } = await verifiedStress(parsed.stress || []).catch(() => ({ marks: {}, missing: [] as string[] }));
    // Words not checked in time are looked up after the answer is sent and
    // cached, so the next stories (and this one's voice, if recorded later) gain.
    if (missing.length) after(() => warmStress(missing, 50000));
    const voiceText = `${addStress(plainTitle, extra, { wiki: false })}.\n\n${addStress(plainStory, extra, { wiki: false })}`;

    // Archive every story (unique key per generation) — history, not dedup.
    const cacheKey = makeCacheKey(childName, themeName || theme, age);
    saveCachedStory(cacheKey, parsed.title, plainStory, imagePrompts).catch(() => {});

    return NextResponse.json({
      title: parsed.title,
      story: plainStory,
      voiceText,
      imagePrompts,
      fromCache: false,
    });
  } catch (error) {
    console.error("Story generation error:", error);
    await refund?.().catch(() => {});
    return NextResponse.json({ error: "Грешка при генериране" }, { status: 500 });
  }
}

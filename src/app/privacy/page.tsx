import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика за поверителност · AuraKids",
  description: "Как AuraKids събира, използва и защитава данните.",
};

const UPDATED = "11 юли 2026";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 22px 80px", lineHeight: 1.7, color: "#EDE7F6" }}>
      <a href="/" style={{ color: "#FFD93D", textDecoration: "none", fontSize: 14 }}>← AuraKids</a>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: "18px 0 6px", color: "#fff" }}>Политика за поверителност</h1>
      <p style={{ fontSize: 13, color: "rgba(237,231,246,0.6)", marginBottom: 28 }}>Последна редакция: {UPDATED}</p>

      <Section title="Кои сме ние">
        AuraKids („ние") създава персонализирани детски приказки и комикси. Тази политика
        обяснява какви данни обработваме в приложенията AuraKids Приказки и AuraKids Комикси
        и на уебсайта aurakids.fun.
      </Section>

      <Section title="Какви данни събираме">
        <ul style={ulStyle}>
          <li><b>Въведеното от теб</b> за създаване на история: име на детето, възраст (диапазон), избран свят/стил и език. Използва се само за да генерираме приказката или комикса.</li>
          <li><b>Създаденото съдържание</b> (текст, илюстрации, глас) се пази, за да можеш да го отваряш пак. Пази се локално на устройството и в облак, свързан с анонимен „семеен код" — без имейл или акаунт.</li>
          <li><b>Технически данни</b>: стандартни логове на сървъра (напр. при грешка). Не използваме рекламни тракери.</li>
        </ul>
      </Section>

      <Section title="Не събираме излишни лични данни">
        Не изискваме регистрация, имейл или парола. „Семейният код" е случаен низ, който
        стои на твоето устройство; всеки с този код вижда съответната библиотека.
        Не продаваме данни и не ги използваме за реклама.
      </Section>

      <Section title="Деца">
        Приложенията са предназначени за родители, които създават съдържание за децата си.
        Не искаме от децата лични данни. Въведеното име се използва единствено в текста на
        историята и може да е псевдоним.
      </Section>

      <Section title="Доставчици, които обработват съдържание">
        За да генерираме историите използваме доставчици на изкуствен интелект и хостинг:
        Anthropic (текст), OpenAI и Google (илюстрации и глас), Supabase (съхранение),
        Vercel (хостинг). Изпратеният към тях текст е този, нужен за създаване на историята.
      </Section>

      <Section title="Съхранение и изтриване">
        Създаденото се пази, докато не го изтриеш от устройството си или не поискаш изтриване.
        За да премахнеш облачно копие, пиши ни на посочения по-долу адрес с твоя семеен код.
      </Section>

      <Section title="Твоите права">
        Имаш право на достъп, корекция и изтриване на данните си. Свържи се с нас за всяко
        такова искане.
      </Section>

      <Section title="Контакт">
        Въпроси относно поверителността: <a href="mailto:fps60@yahoo.com" style={{ color: "#FFD93D" }}>fps60@yahoo.com</a>
      </Section>

      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.12)", margin: "40px 0" }} />

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Privacy Policy (English)</h2>
      <p style={{ fontSize: 13, color: "rgba(237,231,246,0.6)", marginBottom: 20 }}>Last updated: July 11, 2026</p>
      <Section title="Who we are">
        AuraKids creates personalised children&apos;s stories and comics. This policy covers the
        AuraKids Stories and AuraKids Comics apps and the aurakids.fun website.
      </Section>
      <Section title="What we collect">
        <ul style={ulStyle}>
          <li><b>What you enter</b> to create a story: child&apos;s name, age range, chosen world/style and language — used only to generate the story or comic.</li>
          <li><b>The content created</b> (text, illustrations, voice) is stored so you can reopen it — locally and in a cloud copy tied to an anonymous &quot;family code&quot;, with no email or account.</li>
          <li><b>Technical data</b>: standard server logs. No advertising trackers.</li>
        </ul>
      </Section>
      <Section title="Children">
        The apps are for parents creating content for their children. We do not request personal
        data from children; the name entered is used only inside the story text and may be a nickname.
      </Section>
      <Section title="Processors">
        We use AI and hosting providers to generate stories: Anthropic (text), OpenAI and Google
        (images and voice), Supabase (storage), Vercel (hosting).
      </Section>
      <Section title="Your rights & contact">
        You may access, correct or delete your data. Contact{" "}
        <a href="mailto:fps60@yahoo.com" style={{ color: "#FFD93D" }}>fps60@yahoo.com</a>.
      </Section>
    </main>
  );
}

const ulStyle: React.CSSProperties = { margin: "8px 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{title}</h2>
      <div style={{ fontSize: 15, color: "rgba(237,231,246,0.85)" }}>{children}</div>
    </section>
  );
}

import { NextResponse } from "next/server";
import { addStress } from "@/lib/stress";
import { saveAudioToStorage } from "@/lib/supabase";

// TEMPORARY, preview only: the excerpt with ElevenLabs v3 the way the
// subscriber path records it (rechnik + ONIRA stress only, MP3).
export const maxDuration = 120;
const TEXT = "Мая и драконът, който плачеше със сажди.\n\nКамъкът под краката на Мая се търколи надолу и изтрополи по стръмната пътека, а тя се притисна към студената скала на Пепелявата планина. Долу, в селото, звънците биеха тревожно — драконът отново беше минал оттам и беше опърлил покрива на хамбара. „Чудовище! Злодей!\" викаха хората и размахваха вили. Но Мая, която беше само на пет години и половина, беше видяла нещо, което никой друг не забеляза: когато драконът прелетя над комините, от очите му капнаха две едри черни капки, тежки като въглен, и оставиха две димящи дупки в снега.\n\n— Не мисля, че е злодей — прошепна Мая. — Мисля, че му е мъчно.\n\nНа рамото ѝ седеше един дебел сив гълъб на име Мърморко, който се беше самопоканил за спътник още от сутринта и оттогава не млъкваше.";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const key = process.env.ELEVENLABS_API_KEY || "";
  const voice = process.env.ELEVENLABS_VOICE_ID || "";
  const text = addStress(TEXT, {}, { wiki: false });
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_v3", language_code: "bg", voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
  });
  if (!res.ok) return NextResponse.json({ error: res.status, detail: (await res.text()).slice(0, 300) }, { status: 502 });
  const mp3 = await res.arrayBuffer();
  const url = await saveAudioToStorage("lab-otkas-el.mp3", mp3);
  return NextResponse.json({ url, bytes: mp3.byteLength, marks: (text.match(/\u0301/g) || []).length });
}

import { NextResponse } from "next/server";

// Lightweight voice/TTS diagnostic — only checks the TTS providers so the
// response is fast. Reports which key is present and the live API result.
export async function GET() {
  const out: Record<string, string> = {};
  const gKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  out.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ? "SET" : "MISSING";
  out.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? "SET" : "MISSING";
  out.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ? "SET" : "MISSING";

  if (gKey) {
    try {
      const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${gKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: "здравей" },
          voice: { languageCode: "bg-BG", name: "bg-BG-Chirp3-HD-Aoede" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      });
      out.google_cloud_tts = r.ok ? "OK — got audio" : `FAILED ${r.status} — ${(await r.text()).slice(0, 400)}`;
    } catch (e: unknown) {
      out.google_cloud_tts = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    out.google_cloud_tts = "SKIP — no key";
  }

  // Gemini TTS — the path that actually works with a plain API key.
  if (gKey) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${gKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "здравей" }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Schedar" } } },
            },
          }),
        }
      );
      const raw = await r.text();
      if (r.ok) {
        const data = JSON.parse(raw);
        const has = !!data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        out.gemini_tts = has ? "OK — got audio" : `FAILED — no audio: ${raw.slice(0, 500)}`;
      } else {
        out.gemini_tts = `FAILED ${r.status} — ${raw.slice(0, 400)}`;
      }
    } catch (e: unknown) {
      out.gemini_tts = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    out.gemini_tts = "SKIP — no key";
  }

  // Which models can this key see? (find the real TTS model name)
  if (gKey) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${gKey}&pageSize=200`);
      if (r.ok) {
        const data = await r.json();
        const names: string[] = (data?.models || []).map((m: { name?: string }) => m.name || "");
        out.tts_models = names.filter((n) => n.toLowerCase().includes("tts")).join(", ") || "none with 'tts'";
      } else {
        out.tts_models = `list FAILED ${r.status} — ${(await r.text()).slice(0, 200)}`;
      }
    } catch (e: unknown) {
      out.tts_models = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const elKey = process.env.ELEVENLABS_API_KEY;
  if (elKey) {
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": elKey } });
      out.elevenlabs = r.ok ? "OK — key valid" : `FAILED ${r.status} — ${(await r.text()).slice(0, 200)}`;
    } catch (e: unknown) {
      out.elevenlabs = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    out.elevenlabs = "SKIP — no key";
  }

  return NextResponse.json(out);
}

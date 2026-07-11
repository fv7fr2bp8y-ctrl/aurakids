import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const checks: Record<string, string> = {};

  checks.OPENAI_API_KEY = process.env.OPENAI_API_KEY ? "SET" : "MISSING";
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING";
  checks.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? "SET" : "MISSING";
  checks.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ? "SET" : "MISSING";
  checks.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ? "SET" : "MISSING";
  checks.SUPABASE_URL = process.env.SUPABASE_URL ? "SET" : "MISSING";
  checks.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING";

  // ---- TTS provider live checks ----
  const gKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
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
      checks.google_cloud_tts = r.ok ? "OK — got audio" : `FAILED ${r.status} — ${(await r.text()).slice(0, 300)}`;
    } catch (e: unknown) {
      checks.google_cloud_tts = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    checks.google_cloud_tts = "SKIP — no GOOGLE_API_KEY/GEMINI_API_KEY";
  }

  const elKey = process.env.ELEVENLABS_API_KEY;
  if (elKey) {
    try {
      const r = await fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": elKey } });
      checks.elevenlabs = r.ok ? "OK — key valid" : `FAILED ${r.status} — ${(await r.text()).slice(0, 200)}`;
    } catch (e: unknown) {
      checks.elevenlabs = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    checks.elevenlabs = "SKIP — no ELEVENLABS_API_KEY";
  }

  // Test Supabase
  try {
    const sb = getSupabase();
    if (!sb) {
      checks.supabase = "FAILED — client is null";
    } else {
      const { error } = await sb.storage.from("story-images").list("", { limit: 1 });
      checks.supabase = error ? `FAILED — ${error.message}` : "OK";
    }
  } catch (e: unknown) {
    checks.supabase = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test OpenAI image generation
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: "a red circle",
      n: 1,
      size: "1024x1024",
    });
    checks.openai_image = response.data?.[0]?.b64_json ? "OK — got image" : "FAILED — no image data";
  } catch (e: unknown) {
    checks.openai_image = `FAILED — ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}

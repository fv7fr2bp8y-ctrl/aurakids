import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";

export async function GET() {
  const checks: Record<string, string> = {};

  checks.OPENAI_API_KEY = process.env.OPENAI_API_KEY ? "SET" : "MISSING";
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING";
  checks.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? "SET" : "MISSING";
  checks.SUPABASE_URL = process.env.SUPABASE_URL ? "SET" : "MISSING";
  checks.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING";

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

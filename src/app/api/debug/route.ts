import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars (only existence, not values)
  checks.OPENAI_API_KEY = process.env.OPENAI_API_KEY ? "SET" : "MISSING";
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING";
  checks.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? "SET" : "MISSING";
  checks.SUPABASE_URL = process.env.SUPABASE_URL ? "SET" : "MISSING";
  checks.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING";
  checks.ADMIN_KEY = process.env.ADMIN_KEY ? "SET" : "MISSING";

  // Test Supabase connection
  try {
    const sb = getSupabase();
    if (!sb) {
      checks.supabase_connection = "FAILED — client is null";
    } else {
      const { error } = await sb.storage.from("story-images").list("", { limit: 1 });
      checks.supabase_connection = error ? `FAILED — ${error.message}` : "OK";
    }
  } catch (e: unknown) {
    checks.supabase_connection = `EXCEPTION — ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}

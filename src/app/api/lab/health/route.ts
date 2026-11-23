import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// TEMPORARY, preview only: are the AI provider keys alive? Near-zero cost
// (one 1-token Claude call; OpenAI and Google only list models).
export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const out: Record<string, string> = {};
  try {
    const r = await new Anthropic().messages.create({ model: "claude-opus-4-8", max_tokens: 1, messages: [{ role: "user", content: "hi" }] });
    out.anthropic = `ok ${r.model}`;
  } catch (e) { out.anthropic = e instanceof Error ? e.message.slice(0, 200) : "error"; }
  try {
    const r = await fetch("https://api.openai.com/v1/models/gpt-image-1", { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
    out.openai = `${r.status}`;
    const all = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }).then((x) => x.json());
    out.openaiImageModels = (all?.data || []).map((m: { id: string }) => m.id).filter((id: string) => /image|dall/i.test(id)).join(",") || JSON.stringify(all).slice(0, 200);
  } catch { out.openai = "error"; }
  const gk = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${gk}`);
    out.geminiApi = `${r.status}`;
  } catch { out.geminiApi = "error"; }
  out.envs = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY", "ELEVENLABS_API_KEY", "GOOGLE_TTS_ACCESS_TOKEN"].filter((k) => !!process.env[k]).join(",");
  return NextResponse.json(out);
}

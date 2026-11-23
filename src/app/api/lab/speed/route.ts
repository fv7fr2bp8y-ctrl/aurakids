import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// TEMPORARY, preview only: how long does a ~600-word Bulgarian bedtime story take per model?
export const maxDuration = 300;
const PROMPT = "Напиши топла вечерна приказка на български за Калоян, 7 години, който открива малко същество в стенния часовник на дядо си. 7–8 параграфа (около 600 думи), жив език, правилна граматика, щастлив край. Само текстът на приказката.";

export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.json({ error: "not found" }, { status: 404 });
  const m = req.nextUrl.searchParams.get("m") || "claude-opus-4-8";
  const client = new Anthropic();
  const t0 = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = { model: m, max_tokens: 4000, messages: [{ role: "user", content: PROMPT }] };
  if (m === "claude-sonnet-5") params.thinking = { type: "disabled" };
  if (m === "claude-opus-5-5" || m === "claude-sonnet-5-5") params.output_config = { effort: "low" };
  const msg = await client.messages.create(params);
  const text = msg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
  return NextResponse.json({ model: m, seconds: Math.round((Date.now() - t0) / 100) / 10, outTokens: msg.usage.output_tokens, chars: text.length, start: text.slice(0, 400) });
}

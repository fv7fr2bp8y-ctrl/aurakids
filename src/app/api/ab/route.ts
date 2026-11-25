import { NextRequest, NextResponse } from "next/server";
import { getSupabase, jsonBucket } from "@/lib/supabase";
import { hashIp, ipFromHeaders } from "@/lib/quota";
import { AB_EVENTS, KOLEDA_VARIANTS, isVariant, type AbEvent } from "@/lib/abtest";

// Counts for the /koleda test: who saw which variant, who pressed the button,
// who got a finished story, who hit the paywall. Unique visitors per day: each
// day file keeps short hashes per variant and event, never addresses.
const BUCKET = "libraries";
const dayPath = (day: string) => `ab/koleda/${day}.json`;
type Day = Record<string, Partial<Record<AbEvent, string[]>>>;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const v = body?.v;
  const e = body?.e as AbEvent;
  if (!isVariant(v) || !AB_EVENTS.includes(e)) return NextResponse.json({ ok: false }, { status: 400 });
  // Skip bots and link previews.
  const ua = req.headers.get("user-agent") || "";
  if (/bot|crawl|spider|preview|facebookexternalhit|headless/i.test(ua)) return NextResponse.json({ ok: true });
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false });
  const who = hashIp(ipFromHeaders(req.headers)).slice(0, 12);
  const day = new Date().toISOString().slice(0, 10);
  let data: Day = {};
  try {
    const { data: f } = await jsonBucket(sb).download(dayPath(day));
    if (f) data = JSON.parse(await f.text());
  } catch { /* first event of the day */ }
  const list = ((data[v] ??= {})[e] ??= []);
  if (!list.includes(who)) {
    list.push(who);
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    await jsonBucket(sb).upload(dayPath(day), blob, { contentType: "application/json", upsert: true });
  }
  return NextResponse.json({ ok: true });
}

// Report: GET /api/ab → totals per variant and per day. Only counts, no
// visitor data, so it needs no key.
export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "no storage" }, { status: 500 });
  const { data: files } = await jsonBucket(sb).list("ab/koleda", { limit: 400 });
  const total: Record<string, Record<AbEvent, number>> = {};
  for (const v of KOLEDA_VARIANTS) total[v] = { view: 0, click: 0, story: 0, paywall: 0 };
  const days: Record<string, Record<string, Record<string, number>>> = {};
  for (const f of files ?? []) {
    const { data: blob } = await jsonBucket(sb).download(`ab/koleda/${f.name}`);
    if (!blob) continue;
    const d: Day = JSON.parse(await blob.text());
    const day = f.name.replace(".json", "");
    days[day] = {};
    for (const v of KOLEDA_VARIANTS) {
      days[day][v] = {};
      for (const e of AB_EVENTS) {
        const n = d[v]?.[e]?.length ?? 0;
        total[v][e] += n;
        days[day][v][e] = n;
      }
    }
  }
  return NextResponse.json({ total, days });
}

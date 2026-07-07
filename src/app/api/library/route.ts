import { NextRequest, NextResponse } from "next/server";
import { getLibraryFile, putLibraryFile } from "@/lib/supabase";

export const maxDuration = 30;

const CODE = /^[A-Z0-9-]{8,40}$/;

interface LibItem { id: string; date: string; [k: string]: unknown }

// GET ?code=... → the family's saved stories/comics.
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").toUpperCase();
  if (!CODE.test(code)) return NextResponse.json({ items: [] });
  const items = (await getLibraryFile(code)) as LibItem[] | null;
  return NextResponse.json({ items: items ?? [] });
}

// POST { code, item } → append one item (dedupe by id, newest first, cap 100).
export async function POST(req: NextRequest) {
  try {
    const { code: raw, item } = await req.json();
    const code = String(raw || "").toUpperCase();
    if (!CODE.test(code) || !item?.id) return NextResponse.json({ error: "bad request" }, { status: 400 });

    const existing = ((await getLibraryFile(code)) as LibItem[]) || [];
    const merged = [item as LibItem, ...existing.filter((x) => x.id !== item.id)].slice(0, 100);
    const ok = await putLibraryFile(code, merged);
    return ok ? NextResponse.json({ ok: true, count: merged.length }) : NextResponse.json({ error: "save failed" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Cheap abuse brake for the expensive generation endpoints: the browser app
// always sends our own Origin, so reject requests coming from other sites or
// missing it entirely. Not real auth — just keeps drive-by scripts out.
const ALLOWED = [/^https:\/\/(www\.)?aurakids\.fun$/, /^https:\/\/aurakids[\w-]*\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];

function originOf(url: string): string {
  try { return new URL(url).origin; } catch { return ""; }
}

// Fail-open: only reject when we can positively identify a FOREIGN origin.
// If neither Origin nor Referer is present (common for same-origin POSTs and
// installed PWAs/TWAs), allow the request — the goal is just to stop drive-by
// cross-site scripts, not to break our own app.
export function requireSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin") || "";
  const refOrigin = originOf(req.headers.get("referer") || "");
  const candidate = origin || refOrigin;
  if (!candidate) return null; // no signal → allow
  if (ALLOWED.some((re) => re.test(candidate))) return null; // ours → allow
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

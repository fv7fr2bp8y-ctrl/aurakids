import { NextRequest, NextResponse } from "next/server";

// Cheap abuse brake for the expensive generation endpoints: the browser app
// always sends our own Origin, so reject requests coming from other sites or
// missing it entirely. Not real auth — just keeps drive-by scripts out.
const ALLOWED = [/^https:\/\/(www\.)?aurakids\.fun$/, /^https:\/\/aurakids[\w-]*\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];

export function requireSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const ok =
    ALLOWED.some((re) => re.test(origin)) ||
    (!origin && ALLOWED.some((re) => { try { return re.test(new URL(referer).origin); } catch { return false; } }));
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

import { NextRequest, NextResponse } from "next/server";

// App icons are static files now (public/icons/<app>-<size>[-p].png, made
// once from the brand-kit art), so this works on hosts without sharp
// (Cloudflare Workers). Old URLs keep working: /api/icon?size=&app=&padded=1
// redirects to the closest prepared size.
const APPS = new Set(["both", "story", "comic", "favicon"]);
const SIZES = [32, 180, 192, 512];

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const want = parseInt(p.get("size") || "512", 10) || 512;
  const app = APPS.has(p.get("app") || "") ? (p.get("app") as string) : "both";
  const padded = p.get("padded") === "1";
  const pool = padded ? [192, 512] : SIZES;
  const size = pool.find((s) => s >= want) ?? pool[pool.length - 1];
  const url = new URL(`/icons/${app}-${size}${padded ? "-p" : ""}.png`, req.url);
  return NextResponse.redirect(url, { status: 307, headers: { "Cache-Control": "public, max-age=604800" } });
}

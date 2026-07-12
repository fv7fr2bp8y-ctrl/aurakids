import { NextResponse } from "next/server";

// Android Digital Asset Links — verifies the TWA apps against this domain.
// Served at /.well-known/assetlinks.json via a rewrite in next.config.ts.
//
// Set these env vars once you create the Play signing keys:
//   ANDROID_PACKAGE_STORY   (default fun.aurakids.stories)
//   ANDROID_PACKAGE_COMIC   (default fun.aurakids.comics)
//   ANDROID_FINGERPRINTS_STORY  comma-separated SHA-256 cert fingerprints
//   ANDROID_FINGERPRINTS_COMIC  comma-separated SHA-256 cert fingerprints
export const revalidate = 3600;

function statement(pkg: string, fingerprints: string) {
  const fps = fingerprints.split(",").map((s) => s.trim()).filter(Boolean);
  if (!fps.length) return null;
  return {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: fps },
  };
}

export async function GET() {
  const items = [
    statement(process.env.ANDROID_PACKAGE_STORY || "fun.aurakids.stories", process.env.ANDROID_FINGERPRINTS_STORY || ""),
    statement(process.env.ANDROID_PACKAGE_COMIC || "fun.aurakids.comics", process.env.ANDROID_FINGERPRINTS_COMIC || ""),
  ].filter(Boolean);
  return NextResponse.json(items, { headers: { "Content-Type": "application/json" } });
}

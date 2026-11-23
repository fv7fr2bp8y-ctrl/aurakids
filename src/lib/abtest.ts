import { createHash } from "crypto";

// A/B/C test of the Christmas landing page (/koleda). Every visitor gets one
// variant from a hash of their (salted, hashed) IP: nothing is stored on the
// device, and the same visitor sees the same variant.
export const KOLEDA_VARIANTS = ["A", "B", "C"] as const;
export type KoledaVariant = (typeof KOLEDA_VARIANTS)[number];

export function pickVariant(ipHash: string): KoledaVariant {
  const n = parseInt(createHash("sha1").update(`koleda|${ipHash}`).digest("hex").slice(0, 8), 16);
  return KOLEDA_VARIANTS[n % KOLEDA_VARIANTS.length];
}

export function isVariant(v: unknown): v is KoledaVariant {
  return typeof v === "string" && (KOLEDA_VARIANTS as readonly string[]).includes(v);
}

export const AB_EVENTS = ["view", "click", "story", "paywall"] as const;
export type AbEvent = (typeof AB_EVENTS)[number];

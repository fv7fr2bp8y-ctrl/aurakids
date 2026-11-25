import { createClient } from "@supabase/supabase-js";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://aurakids.fun";
type Sb = NonNullable<ReturnType<typeof getSupabase>>;
let storageDown = false;

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getCachedStory(cacheKey: string) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("stories")
    .select("title, story, image_prompts")
    .eq("cache_key", cacheKey)
    .single();
  return data ?? null;
}

export async function saveCachedStory(
  cacheKey: string,
  title: string,
  story: string,
  imagePrompts: string[]
) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("stories").upsert({ cache_key: cacheKey, title, story, image_prompts: imagePrompts });
}

export async function getCachedImage(fileName: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  if (await hasDbImage(fileName).catch(() => false)) return `${SITE}/api/img/${fileName}`;
  if (storageDown) return null;
  const { data: files, error } = await sb.storage.from("story-images").list("", { search: fileName });
  if (error) { if (/restricted|quota/i.test(error.message)) storageDown = true; return null; }
  if (!files?.length) return null;
  const { data } = sb.storage.from("story-images").getPublicUrl(fileName);
  return data.publicUrl;
}

// New pictures go to the database (compact JPEG), not the storage bucket.
export async function saveImageToStorage(fileName: string, source: string | ArrayBuffer): Promise<string | null> {
  try {
    let buf: Buffer;
    if (typeof source === "string") {
      const res = await fetch(source);
      if (!res.ok) return null;
      buf = Buffer.from(await res.arrayBuffer());
    } else {
      buf = Buffer.from(source);
    }
    return await saveDbImage(fileName, buf);
  } catch (e) {
    console.error("saveImageToStorage exception:", e);
    return null;
  }
}

// ---------- Cloud library (per family code, JSON in a private bucket) ----------
const LIB_BUCKET = "libraries";

async function ensureLibBucket(sb: NonNullable<ReturnType<typeof getSupabase>>) {
  void sb; // records live in the kv table now
}

export async function getLibraryFile(code: string): Promise<unknown[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await jsonBucket(sb).download(`${code}.json`);
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function putLibraryFile(code: string, items: unknown[]): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    await ensureLibBucket(sb);
    const body = new Blob([JSON.stringify(items)], { type: "application/json" });
    const { error } = await jsonBucket(sb).upload(`${code}.json`, body, {
      contentType: "application/json", upsert: true,
    });
    return !error;
  } catch {
    return false;
  }
}

// ---------- Paid unlock markers (per family code) ----------
export async function markUnlocked(code: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    await ensureLibBucket(sb);
    const body = new Blob([JSON.stringify({ unlocked: true, at: new Date().toISOString() })], { type: "application/json" });
    const { error } = await jsonBucket(sb).upload(`unlocks/${code}.json`, body, {
      contentType: "application/json", upsert: true,
    });
    return !error;
  } catch {
    return false;
  }
}

// Paid = one-time "Пълен достъп" (old) or a live subscription / trial.
export async function isCodeUnlocked(code: string): Promise<boolean> {
  const { getEntitlement } = await import("@/lib/billing");
  return (await getEntitlement(code)).paid;
}

export async function getCachedAudio(fileName: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: files, error } = await sb.storage.from("story-audio").list("", { search: fileName });
  if (error || !files?.length) return null;
  const { data } = sb.storage.from("story-audio").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function saveAudioToStorage(fileName: string, audio: ArrayBuffer): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const contentType = fileName.endsWith(".mp3") ? "audio/mpeg" : "audio/wav";
    const { error } = await sb.storage
      .from("story-audio")
      .upload(fileName, audio, { contentType, upsert: true });
    if (error) return null;
    const { data } = sb.storage.from("story-audio").getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

// ---------- Small JSON records in the database ----------
// The "libraries" storage bucket held small JSON files (subscriptions, unlocks,
// libraries, limits, A/B counts, stress cache). Storage can be cut off when the
// plan's file quota runs out, so these now live in the `kv` table. jsonBucket()
// keeps the same download/upload/list shape the callers already use. Reads fall
// back to the old bucket, so records written before the move still count once
// storage answers again.

export function jsonBucket(sb: Sb) {
  const old = sb.storage.from("libraries");
  return {
    async download(path: string): Promise<{ data: { text: () => Promise<string> } | null; error: unknown }> {
      try {
        const { data, error } = await sb.from("kv").select("value").eq("key", path).maybeSingle();
        if (!error && data) {
          const s = JSON.stringify(data.value);
          return { data: { text: async () => s }, error: null };
        }
      } catch { /* fall through to the old bucket */ }
      if (storageDown) return { data: null, error: "missing" };
      const r = await old.download(path);
      if (r.error && /restricted|quota/i.test(String((r.error as { message?: string }).message))) storageDown = true;
      return r;
    },
    async upload(path: string, body: Blob | string, _opts?: unknown): Promise<{ error: unknown }> {
      const text = typeof body === "string" ? body : await body.text();
      const { error } = await sb.from("kv").upsert({ key: path, value: JSON.parse(text), updated_at: new Date().toISOString() });
      if (error) console.error("kv write error:", error.message);
      return { error };
    },
    async list(prefix: string, _opts?: unknown): Promise<{ data: { name: string }[] | null; error: unknown }> {
      const p = prefix.replace(/\/?$/, "/");
      const { data, error } = await sb.from("kv").select("key").like("key", `${p}%`).limit(1000);
      const names = (data ?? []).map((r: { key: string }) => r.key.slice(p.length)).filter((n: string) => n && !n.includes("/"));
      return { data: names.map((name: string) => ({ name })), error };
    },
  };
}

// ---------- Story pictures in the database ----------
// Pictures are stored as compact JPEG in the `img` table and served by
// /api/img/<name>, so they keep working without the storage bucket.
export async function getDbImage(name: string): Promise<{ mime: string; b64: string } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("img").select("mime,b64").eq("name", name).maybeSingle();
  return error || !data ? null : data;
}

export async function hasDbImage(name: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data, error } = await sb.from("img").select("name").eq("name", name).maybeSingle();
  return !error && !!data;
}

export async function saveDbImage(name: string, buf: Buffer): Promise<string | null> {
  const sharp = (await import("sharp")).default;
  const jpg = await sharp(buf).resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  const b64 = jpg.toString("base64");
  // A picture that was already paid for is never thrown away: if it cannot be
  // stored, it goes back inside the answer.
  const inline = `data:image/jpeg;base64,${b64}`;
  const sb = getSupabase();
  if (!sb) return inline;
  const { error } = await sb.from("img").upsert({ name, mime: "image/jpeg", b64 });
  if (error) { console.error("img write error:", error.message); return inline; }
  // Keep the table inside the free database size: drop pictures older than 60 days.
  if (Math.random() < 0.05) {
    const cutoff = new Date(Date.now() - 60 * 86400_000).toISOString();
    await sb.from("img").delete().lt("created_at", cutoff).then(() => {}, () => {});
  }
  return `${SITE}/api/img/${name}`;
}

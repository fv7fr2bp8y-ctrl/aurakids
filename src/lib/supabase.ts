import { createClient } from "@supabase/supabase-js";

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
  const { data: files, error } = await sb.storage.from("story-images").list("", { search: fileName });
  if (error || !files?.length) return null;
  const { data } = sb.storage.from("story-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function saveImageToStorage(fileName: string, source: string | ArrayBuffer): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    let arrayBuffer: ArrayBuffer;
    if (typeof source === "string") {
      const res = await fetch(source);
      if (!res.ok) return null;
      arrayBuffer = await res.arrayBuffer();
    } else {
      arrayBuffer = source;
    }
    const { error } = await sb.storage
      .from("story-images")
      .upload(fileName, arrayBuffer, { contentType: "image/png", upsert: true });
    if (error) { console.error("Supabase upload error:", error); return null; }
    const { data } = sb.storage.from("story-images").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error("saveImageToStorage exception:", e);
    return null;
  }
}

export async function getCachedAudio(fileName: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: files, error } = await sb.storage.from("story-audio").list("", { search: fileName });
  if (error || !files?.length) return null;
  const { data } = sb.storage.from("story-audio").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function saveAudioToStorage(fileName: string, wav: ArrayBuffer): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { error } = await sb.storage
      .from("story-audio")
      .upload(fileName, wav, { contentType: "audio/wav", upsert: true });
    if (error) return null;
    const { data } = sb.storage.from("story-audio").getPublicUrl(fileName);
    return data.publicUrl;
  } catch {
    return null;
  }
}

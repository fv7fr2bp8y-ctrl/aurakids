// Native share sheet with a clipboard fallback. Returns a short status the UI
// can flash ("shared" | "copied" | "").
export async function shareApp(title: string, text: string, url?: string): Promise<"shared" | "copied" | ""> {
  const link = url || (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://aurakids.fun");
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text, url: link });
      return "shared";
    }
  } catch {
    return ""; // user cancelled the share sheet
  }
  try {
    await navigator.clipboard.writeText(link);
    return "copied";
  } catch {
    return "";
  }
}

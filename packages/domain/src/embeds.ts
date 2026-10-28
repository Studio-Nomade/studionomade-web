export type EmbedProvider = "vimeo" | "behance";

export type SafeEmbed = {
  provider: EmbedProvider;
  sourceUrl: string;
  embedUrl: string;
  fallbackUrl: string;
};

export function parseSafeEmbed(rawUrl: string): SafeEmbed | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
    const id = url.pathname
      .split("/")
      .filter(Boolean)
      .reverse()
      .find((part) => /^\d+$/.test(part));
    if (!id) return null;
    return {
      provider: "vimeo",
      sourceUrl: `https://vimeo.com/${id}`,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      fallbackUrl: `https://vimeo.com/${id}`
    };
  }

  if (hostname === "behance.net") {
    const path = url.pathname.replace(/\/{2,}/g, "/");
    if (!path.startsWith("/gallery/") && path.split("/").filter(Boolean).length < 1) return null;
    const normalized = `https://www.behance.net${path}`;
    return {
      provider: "behance",
      sourceUrl: normalized,
      embedUrl: normalized,
      fallbackUrl: normalized
    };
  }

  return null;
}

export function manualSocialCardProvider(rawUrl: string) {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./, "");
    if (host === "instagram.com") return "instagram";
    if (host === "threads.net") return "threads";
    if (host === "linkedin.com") return "linkedin";
  } catch {
    return null;
  }
  return null;
}

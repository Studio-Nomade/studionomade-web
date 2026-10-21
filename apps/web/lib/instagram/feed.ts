/**
 * Últimas publicaciones de la cuenta oficial de Instagram (@studionomade_).
 *
 * Usa la API de Instagram con inicio de sesión de Instagram
 * (graph.instagram.com) y un token de larga duración en
 * `INSTAGRAM_ACCESS_TOKEN` (solo servidor). El token dura 60 días y se renueva
 * con `GET /refresh_access_token` (ver docs/analytics-campanas.md → Instagram).
 * La respuesta se cachea una hora (ISR). Sin token o si la API falla, devuelve
 * `null` y la home muestra su selección fija.
 */
export interface InstagramPost {
  id: string;
  /** Imagen a mostrar: la foto, la portada del video o la primera del carrusel. */
  image: string;
  permalink: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
}

interface RawMedia {
  id: string;
  caption?: string;
  media_type: InstagramPost["mediaType"];
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

const API = "https://graph.instagram.com/v22.0/me/media";
const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

export function normalizeMedia(items: RawMedia[], limit: number): InstagramPost[] {
  return items
    .map((item) => ({
      id: item.id,
      image: (item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url) ?? "",
      permalink: item.permalink,
      caption: (item.caption ?? "").trim(),
      mediaType: item.media_type,
      timestamp: item.timestamp
    }))
    .filter((post) => post.image.startsWith("https://") && post.permalink.startsWith("https://"))
    .slice(0, limit);
}

export async function getInstagramPosts(limit = 5): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return null;
  try {
    const url = `${API}?fields=${FIELDS}&limit=${limit + 3}&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: RawMedia[] };
    const posts = normalizeMedia(body.data ?? [], limit);
    return posts.length ? posts : null;
  } catch {
    return null;
  }
}

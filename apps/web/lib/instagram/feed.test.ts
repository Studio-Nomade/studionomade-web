import { afterEach, describe, expect, it, vi } from "vitest";

import { getInstagramPosts, normalizeMedia } from "./feed";

const media = (overrides: Record<string, unknown> = {}) => ({
  id: "1",
  caption: " Hola ",
  media_type: "IMAGE",
  media_url: "https://scontent.cdninstagram.com/a.jpg",
  permalink: "https://www.instagram.com/p/abc/",
  timestamp: "2026-10-20T12:00:00+0000",
  ...overrides
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("normalizeMedia", () => {
  it("usa la portada en videos, recorta el texto y limita la cantidad", () => {
    const posts = normalizeMedia(
      [
        media(),
        media({ id: "2", media_type: "VIDEO", thumbnail_url: "https://x.cdninstagram.com/t.jpg" }),
        media({ id: "3" }),
        media({ id: "4" }),
        media({ id: "5" }),
        media({ id: "6" })
      ] as never,
      5
    );
    expect(posts).toHaveLength(5);
    expect(posts[0]).toMatchObject({
      caption: "Hola",
      image: "https://scontent.cdninstagram.com/a.jpg"
    });
    expect(posts[1].image).toBe("https://x.cdninstagram.com/t.jpg");
  });

  it("descarta publicaciones sin imagen https", () => {
    expect(normalizeMedia([media({ media_url: undefined })] as never, 5)).toEqual([]);
  });
});

describe("getInstagramPosts", () => {
  it("sin token no llama a la API", async () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await getInstagramPosts()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("si la API falla devuelve null", async () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await getInstagramPosts()).toBeNull();
  });

  it("devuelve las últimas publicaciones", async () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [media()] }) })
    );
    expect(await getInstagramPosts()).toHaveLength(1);
  });
});

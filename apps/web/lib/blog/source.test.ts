import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { LOCAL_BLOG_POSTS } from "../../content/blog";
import { getBlogPosts, rowToPost } from "./source";

afterEach(() => vi.unstubAllEnvs());

const row = {
  slug: "nota",
  title: "Nota",
  excerpt: null,
  body: [{ type: "paragraph", text: [{ text: "Hola", mark: "none" }] }],
  cover_url: null,
  cover_alt: null,
  category: "Estudio",
  tags: ["a"],
  area: "branding",
  author_name: null,
  published_at: "2026-10-21T12:00:00Z"
};

describe("rowToPost", () => {
  it("convierte una fila válida", () => {
    expect(rowToPost(row)).toMatchObject({ slug: "nota", area: "branding", excerpt: "" });
  });

  it("descarta cuerpos inválidos o sin fecha de publicación", () => {
    expect(rowToPost({ ...row, body: [{ type: "html", value: "<b>" }] })).toBeNull();
    expect(rowToPost({ ...row, published_at: null })).toBeNull();
  });

  it("ignora áreas desconocidas", () => {
    expect(rowToPost({ ...row, area: "otra" })?.area).toBeUndefined();
  });
});

describe("getBlogPosts", () => {
  it("sin Supabase usa el respaldo local", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(await getBlogPosts()).toEqual(LOCAL_BLOG_POSTS);
  });
});

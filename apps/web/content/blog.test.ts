import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { blogBodySchema } from "@studionomade/content-schema";
import { describe, expect, it } from "vitest";

import { LOCAL_BLOG_POSTS } from "./blog";

describe("respaldo local del blog", () => {
  it("tiene notas válidas, con slug único y portada existente", () => {
    expect(LOCAL_BLOG_POSTS.length).toBeGreaterThan(0);
    const slugs = new Set<string>();
    for (const post of LOCAL_BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(slugs.has(post.slug)).toBe(false);
      slugs.add(post.slug);
      expect(blogBodySchema.safeParse(post.body).success).toBe(true);
      expect(Number.isNaN(Date.parse(post.publishedAt))).toBe(false);
      if (post.cover?.src.startsWith("/")) {
        expect(existsSync(resolve(__dirname, "../public", post.cover.src.slice(1)))).toBe(true);
      }
    }
  });

  it("está ordenado de la más reciente a la más antigua", () => {
    const dates = LOCAL_BLOG_POSTS.map((post) => post.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

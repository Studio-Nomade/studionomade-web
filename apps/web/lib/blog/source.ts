import "server-only";

import { createPublicDatabaseClient } from "@studionomade/database";
import { blogBodySchema } from "@studionomade/content-schema";

import { STUDIO_AREAS, type StudioAreaSlug } from "../../content/area-meta";
import { LOCAL_BLOG_POSTS, type BlogPost } from "../../content/blog";

const AREA_SLUGS = new Set<string>(STUDIO_AREAS.map((area) => area.slug));

interface BlogRow {
  slug: string;
  title: string;
  excerpt: string | null;
  body: unknown;
  cover_url: string | null;
  cover_alt: string | null;
  category: string;
  tags: string[];
  area: string | null;
  author_name: string | null;
  published_at: string | null;
}

/** Fila de `blog_posts` → nota del sitio. Descarta filas con cuerpo inválido. */
export function rowToPost(row: BlogRow): BlogPost | null {
  const body = blogBodySchema.safeParse(row.body);
  if (!body.success || !row.published_at) return null;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: body.data,
    cover: row.cover_url ? { src: row.cover_url, alt: row.cover_alt ?? row.title } : undefined,
    category: row.category,
    tags: row.tags ?? [],
    area: row.area && AREA_SLUGS.has(row.area) ? (row.area as StudioAreaSlug) : undefined,
    author: row.author_name ?? undefined,
    publishedAt: row.published_at
  };
}

function client() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createPublicDatabaseClient(url, key) : null;
}

/**
 * Notas publicadas, más recientes primero. Sin Supabase configurado, o si la
 * consulta falla o no trae nada, usa el respaldo local.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const database = client();
  if (!database) return LOCAL_BLOG_POSTS;
  try {
    const { data, error } = await database
      .from("blog_posts")
      .select(
        "slug,title,excerpt,body,cover_url,cover_alt,category,tags,area,author_name,published_at"
      )
      .eq("status", "publicado")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(200);
    if (error || !data?.length) return LOCAL_BLOG_POSTS;
    const posts = data.map((row) => rowToPost(row as BlogRow)).filter((p): p is BlogPost => !!p);
    return posts.length ? posts : LOCAL_BLOG_POSTS;
  } catch {
    return LOCAL_BLOG_POSTS;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}

export { formatPostDate } from "./format";

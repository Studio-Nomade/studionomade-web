import { hasPermission, requirePermission } from "@studionomade/auth";
import { blogBodySchema, blogBodyToMarkdown } from "@studionomade/content-schema";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../../../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../../../lib/env";
import { createAdminServerClient } from "../../../../lib/supabase-server";
import { deleteBlogPost } from "../actions";
import { BlogForm } from "../blog-form";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  guardar: "Borrador guardado.",
  publicar: "Nota publicada. Aparece en el sitio en unos minutos.",
  despublicar: "La nota volvió a borrador.",
  archivar: "Nota archivada."
};

/** `datetime-local` usa la hora local de Santiago sin zona. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
  return parts.replace(" ", "T");
}

export default async function EditBlogPostPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const client = await createAdminServerClient();
  const { access } = await requirePermission(
    client,
    readAdminServerEnvironment().allowlist,
    "content.write"
  );
  const { data: post } = await client.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();
  const body = blogBodySchema.safeParse(post.body);
  const canPublish = hasPermission(access, "content.publish");

  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <p>
            <Link href="/blog">← Blog</Link>
          </p>
          <h1>{post.title}</h1>
          <p>
            <span className={styles.badge} data-status={post.status}>
              {post.status}
            </span>{" "}
            /blog/{post.slug}
          </p>
        </div>
      </header>
      {aviso && NOTICES[aviso] ? (
        <p className={styles.notice} data-tone="ok" role="status">
          {NOTICES[aviso]}
        </p>
      ) : null}
      <BlogForm
        canPublish={canPublish}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          markdown: body.success ? blogBodyToMarkdown(body.data) : "",
          cover_url: post.cover_url ?? "",
          cover_alt: post.cover_alt ?? "",
          category: post.category,
          tags: (post.tags ?? []).join(", "),
          area: post.area ?? "",
          author_name: post.author_name ?? "",
          published_at: toLocalInput(post.published_at),
          status: post.status
        }}
      />
      {canPublish ? (
        <form action={deleteBlogPost} className={styles.actions}>
          <input type="hidden" name="id" value={post.id} />
          <button type="submit" className={styles.buttonGhost}>
            Eliminar nota
          </button>
        </form>
      ) : null}
    </main>
  );
}

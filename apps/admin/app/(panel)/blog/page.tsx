import { requirePermission } from "@studionomade/auth";
import Link from "next/link";

import styles from "../../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../../lib/env";
import { createAdminServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeZone: "America/Santiago"
});

/** Notas del blog: todas, con su estado. Publicar requiere content.publish. */
export default async function BlogAdminPage({
  searchParams
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const { aviso } = await searchParams;
  const client = await createAdminServerClient();
  await requirePermission(client, readAdminServerEnvironment().allowlist, "content.read");
  const { data, error } = await client
    .from("blog_posts")
    .select("id,title,slug,category,status,published_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("No fue posible cargar las notas");

  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <h1>Blog</h1>
          <p>Notas del sitio público. Lo publicado aparece en studionomade.cl/blog en minutos.</p>
        </div>
        <Link href="/blog/nueva" className={styles.button}>
          Nueva nota
        </Link>
      </header>
      {aviso === "eliminada" ? (
        <p className={styles.notice} data-tone="ok" role="status">
          Nota eliminada.
        </p>
      ) : null}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Categoría</th>
              <th scope="col">Estado</th>
              <th scope="col">Publicación</th>
              <th scope="col">Actualizada</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  Aún no hay notas. El sitio muestra las notas de respaldo hasta que publiques la
                  primera.
                </td>
              </tr>
            ) : (
              data.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    <br />
                    <span className={styles.muted}>/blog/{post.slug}</span>
                  </td>
                  <td>{post.category}</td>
                  <td>
                    <span className={styles.badge} data-status={post.status}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.published_at ? date.format(new Date(post.published_at)) : "—"}</td>
                  <td>{date.format(new Date(post.updated_at))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

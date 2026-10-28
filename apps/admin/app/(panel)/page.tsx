import { requireAdminAccess } from "@studionomade/auth";
import { LEAD_LABELS, LEAD_STATUSES } from "@studionomade/validation";
import Link from "next/link";

import styles from "../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

const LEAD_ROLES = ["superadmin", "admin", "commercial"];

/** Inicio del panel: pendientes de leads y estado del blog. */
export default async function HomePage() {
  const client = await createAdminServerClient();
  const { user, access } = await requireAdminAccess(client, readAdminServerEnvironment().allowlist);
  const seesLeads = access.roles.some((role) => LEAD_ROLES.includes(role));

  const [leadCounts, posts] = await Promise.all([
    seesLeads
      ? Promise.all(
          LEAD_STATUSES.map(async (status) => {
            const { count } = await client
              .from("leads")
              .select("id", { count: "exact", head: true })
              .eq("status", status);
            return [status, count ?? 0] as const;
          })
        )
      : Promise.resolve([]),
    client
      .from("blog_posts")
      .select("id,title,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(5)
  ]);

  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <h1>Hola, {user.displayName ?? user.email}</h1>
          <p>Permisos: {access.permissions.join(", ") || "ninguno"}</p>
        </div>
      </header>

      {seesLeads ? (
        <section className={styles.panel} aria-labelledby="inicio-leads">
          <h2 id="inicio-leads">Leads por estado</h2>
          <div className={styles.counters}>
            {leadCounts.map(([status, count]) => (
              <Link key={status} href={`/leads?estado=${status}`}>
                {LEAD_LABELS.status[status]} <strong>{count}</strong>
              </Link>
            ))}
          </div>
          <Link href="/leads?estado=nuevo" className={styles.button}>
            Revisar leads nuevos
          </Link>
        </section>
      ) : null}

      <section className={styles.panel} aria-labelledby="inicio-blog">
        <h2 id="inicio-blog">Blog</h2>
        {posts.data?.length ? (
          <ul className={styles.timeline}>
            {posts.data.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.id}`}>{post.title}</Link>{" "}
                <span className={styles.badge} data-status={post.status}>
                  {post.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Aún no hay notas en la base.</p>
        )}
        <div className={styles.actions}>
          <Link href="/blog/nueva" className={styles.button}>
            Nueva nota
          </Link>
        </div>
      </section>
    </main>
  );
}

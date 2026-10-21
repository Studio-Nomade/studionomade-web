import { hasPermission, requirePermission } from "@studionomade/auth";
import Link from "next/link";

import styles from "../../../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../../../lib/env";
import { createAdminServerClient } from "../../../../lib/supabase-server";
import { BlogForm } from "../blog-form";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const client = await createAdminServerClient();
  const { access } = await requirePermission(
    client,
    readAdminServerEnvironment().allowlist,
    "content.write"
  );
  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <p>
            <Link href="/blog">← Blog</Link>
          </p>
          <h1>Nueva nota</h1>
        </div>
      </header>
      <BlogForm
        canPublish={hasPermission(access, "content.publish")}
        values={{
          title: "",
          slug: "",
          excerpt: "",
          markdown: "",
          cover_url: "",
          cover_alt: "",
          category: "Estudio",
          tags: "",
          area: "",
          author_name: "Studio Nomade",
          published_at: ""
        }}
      />
    </main>
  );
}

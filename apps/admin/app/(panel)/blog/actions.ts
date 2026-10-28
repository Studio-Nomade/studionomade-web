"use server";

import { requirePermission } from "@studionomade/auth";
import { blogBodySchema, markdownToBlogBody } from "@studionomade/content-schema";
import { blogPostInputSchema } from "@studionomade/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { santiagoLocalToIso } from "../../../lib/dates";
import { readAdminServerEnvironment } from "../../../lib/env";
import { createAdminServerClient } from "../../../lib/supabase-server";

export interface BlogFormState {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
}

const STATUS_BY_INTENT = {
  guardar: undefined,
  publicar: "publicado",
  despublicar: "borrador",
  archivar: "archivado"
} as const;

/**
 * Crea o actualiza una nota. El cuerpo llega en markdown mínimo y se guarda
 * como bloques validados. Publicar exige content.publish (lo vuelve a exigir
 * la base con un trigger).
 */
export async function saveBlogPost(
  _previous: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const parsed = blogPostInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Revisa los campos marcados.", errors };
  }
  const input = parsed.data;
  const body = markdownToBlogBody(input.markdown);
  const bodyCheck = blogBodySchema.safeParse(body);
  if (!bodyCheck.success) {
    return {
      ok: false,
      message: "El cuerpo tiene un bloque inválido (revisa imágenes y enlaces).",
      errors: { markdown: bodyCheck.error.issues[0]?.message ?? "Contenido inválido" }
    };
  }

  const client = await createAdminServerClient();
  const allowlist = readAdminServerEnvironment().allowlist;
  const { user } = await requirePermission(
    client,
    allowlist,
    input.intent === "guardar" ? "content.write" : "content.publish"
  );

  const status = STATUS_BY_INTENT[input.intent];
  const row = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: bodyCheck.data,
    cover_url: input.cover_url,
    cover_alt: input.cover_alt,
    category: input.category,
    tags: input.tags,
    area: input.area,
    author_name: input.author_name,
    ...(input.published_at ? { published_at: santiagoLocalToIso(input.published_at) } : {}),
    ...(status ? { status } : {}),
    updated_by: user.id
  };

  const result = input.id
    ? await client.from("blog_posts").update(row).eq("id", input.id).select("id").single()
    : await client
        .from("blog_posts")
        .insert({ ...row, created_by: user.id })
        .select("id")
        .single();

  if (result.error || !result.data) {
    const duplicate = result.error?.code === "23505";
    return {
      ok: false,
      message: duplicate ? "Ya existe una nota con ese slug." : "No pudimos guardar la nota.",
      errors: duplicate ? { slug: "Slug en uso" } : undefined
    };
  }

  revalidatePath("/blog");
  redirect(`/blog/${result.data.id}?aviso=${input.intent}`);
}

export async function deleteBlogPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const client = await createAdminServerClient();
  await requirePermission(client, readAdminServerEnvironment().allowlist, "content.publish");
  await client.from("blog_posts").delete().eq("id", id);
  revalidatePath("/blog");
  redirect("/blog?aviso=eliminada");
}

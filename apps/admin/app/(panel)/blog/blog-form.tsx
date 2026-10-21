"use client";

import { slugify } from "@studionomade/validation";
import { useActionState, useState } from "react";

import styles from "../../../components/admin.module.css";
import { saveBlogPost, type BlogFormState } from "./actions";

export interface BlogFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  markdown: string;
  cover_url: string;
  cover_alt: string;
  category: string;
  tags: string;
  area: string;
  author_name: string;
  published_at: string;
  status?: string;
}

const CATEGORIES = [
  "Estudio",
  "Branding",
  "Arquitectura",
  "Audiovisual",
  "Web Design",
  "Tendencias"
];
const AREAS = [
  ["", "Sin área"],
  ["branding", "Branding & Design"],
  ["architecture", "Architecture & Design"],
  ["audiovisual", "Audiovisual & Animation"],
  ["web-design", "Web Design"]
] as const;

const INITIAL: BlogFormState = { ok: true };

/** Formulario de nota: funciona con Server Action y conserva lo escrito si falla. */
export function BlogForm({ values, canPublish }: { values: BlogFormValues; canPublish: boolean }) {
  const [state, action, pending] = useActionState(saveBlogPost, INITIAL);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(values.slug));
  const error = (field: string) =>
    state.errors?.[field] ? (
      <span className={styles.error} id={`${field}-error`}>
        {state.errors[field]}
      </span>
    ) : null;
  const described = (field: string) => (state.errors?.[field] ? `${field}-error` : undefined);

  return (
    <form action={action} className={styles.panel}>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? (
        <p className={styles.notice} data-tone={state.ok ? "ok" : "error"} role="alert">
          {state.message}
        </p>
      ) : null}
      <div className={styles.formGrid}>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>Título</span>
          <input
            name="title"
            required
            defaultValue={values.title}
            aria-describedby={described("title")}
            onChange={(event) => {
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
          {error("title")}
        </label>
        <label className={styles.field}>
          <span>Slug (URL)</span>
          <input
            name="slug"
            required
            value={slug}
            aria-describedby={described("slug")}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
          />
          <span className={styles.hint}>studionomade.cl/blog/{slug || "…"}</span>
          {error("slug")}
        </label>
        <label className={styles.field}>
          <span>Categoría</span>
          <select name="category" defaultValue={values.category || "Estudio"}>
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>Bajada (extracto)</span>
          <textarea
            name="excerpt"
            defaultValue={values.excerpt}
            maxLength={400}
            aria-describedby={described("excerpt")}
          />
          {error("excerpt")}
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>Cuerpo</span>
          <textarea
            name="markdown"
            data-tall=""
            required
            defaultValue={values.markdown}
            aria-describedby={`markdown-ayuda ${described("markdown") ?? ""}`.trim()}
          />
          <span className={styles.hint} id="markdown-ayuda">
            Separa bloques con una línea en blanco. ## Título · ### Subtítulo · - lista · 1. lista
            numerada · &gt; cita · **negrita** · *cursiva* · ![texto alternativo](https://…
            &quot;pie&quot;)
          </span>
          {error("markdown")}
        </label>
        <label className={styles.field}>
          <span>Portada (URL)</span>
          <input
            name="cover_url"
            defaultValue={values.cover_url}
            placeholder="https://assets.studionomade.cl/…"
            aria-describedby={described("cover_url")}
          />
          {error("cover_url")}
        </label>
        <label className={styles.field}>
          <span>Texto alternativo de la portada</span>
          <input name="cover_alt" defaultValue={values.cover_alt} />
        </label>
        <label className={styles.field}>
          <span>Etiquetas</span>
          <input name="tags" defaultValue={values.tags} placeholder="Branding, Web design" />
          <span className={styles.hint}>Separadas por coma (máx. 12).</span>
        </label>
        <label className={styles.field}>
          <span>Área</span>
          <select name="area" defaultValue={values.area}>
            {AREAS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Autor</span>
          <input name="author_name" defaultValue={values.author_name} placeholder="Studio Nomade" />
        </label>
        <label className={styles.field}>
          <span>Fecha de publicación</span>
          <input type="datetime-local" name="published_at" defaultValue={values.published_at} />
          <span className={styles.hint}>Vacía: se usa el momento de publicar.</span>
        </label>
      </div>
      <div className={styles.actions}>
        <button
          type="submit"
          name="intent"
          value="guardar"
          className={styles.buttonGhost}
          disabled={pending}
        >
          Guardar borrador
        </button>
        {canPublish ? (
          values.status === "publicado" ? (
            <>
              <button
                type="submit"
                name="intent"
                value="publicar"
                className={styles.button}
                disabled={pending}
              >
                Actualizar publicada
              </button>
              <button
                type="submit"
                name="intent"
                value="despublicar"
                className={styles.buttonGhost}
                disabled={pending}
              >
                Despublicar
              </button>
            </>
          ) : (
            <button
              type="submit"
              name="intent"
              value="publicar"
              className={styles.button}
              disabled={pending}
            >
              Publicar
            </button>
          )
        ) : null}
        {canPublish && values.id && values.status !== "archivado" ? (
          <button
            type="submit"
            name="intent"
            value="archivar"
            className={styles.buttonGhost}
            disabled={pending}
          >
            Archivar
          </button>
        ) : null}
      </div>
    </form>
  );
}

import { markdownToBlogBody, type BlogBody } from "@studionomade/content-schema";

import type { StudioAreaSlug } from "./area-meta";

/**
 * Notas del blog. La fuente principal es Supabase (`blog_posts`, editable en el
 * admin). Este archivo es el respaldo local: se usa cuando el sitio no tiene
 * las variables de Supabase (previews) o la consulta falla, y conserva las
 * notas rescatadas de la web anterior.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: BlogBody;
  cover?: { src: string; alt: string };
  category: string;
  tags: string[];
  area?: StudioAreaSlug;
  author?: string;
  /** ISO 8601. */
  publishedAt: string;
}

export const BLOG_CATEGORIES = [
  "Estudio",
  "Branding",
  "Arquitectura",
  "Audiovisual",
  "Web Design",
  "Tendencias"
] as const;

const post = (input: Omit<BlogPost, "body"> & { markdown: string }): BlogPost => {
  const { markdown, ...rest } = input;
  return { ...rest, body: markdownToBlogBody(markdown) };
};

/** Respaldo local (orden: más reciente primero). */
export const LOCAL_BLOG_POSTS: BlogPost[] = [
  post({
    slug: "guia-paso-a-paso-para-crear-un-sitio-web-efectivo",
    title: "Guía: paso a paso para crear un sitio web efectivo",
    excerpt:
      "Un sitio efectivo no parte por el diseño: parte por el objetivo. Repasamos las etapas con las que trabajamos cada proyecto web.",
    category: "Web Design",
    tags: ["Empresas emergentes", "Ecommerce", "Web Design", "Desarrollo web"],
    area: "web-design",
    author: "Studio Nomade",
    publishedAt: "2025-11-26T12:00:00-03:00",
    cover: {
      src: "/home/legado/blog-sitio-web.webp",
      alt: "Equipo trabajando sobre un mapa de experiencia con notas adhesivas"
    },
    // TODO-contenido: reemplazar por el texto original de la nota cuando se
    // recupere desde la base del WordPress anterior.
    markdown: `Un sitio web efectivo no parte por el diseño: parte por el **objetivo**. Antes de abrir una herramienta, definimos qué tiene que lograr el sitio y para quién.

## 1. Objetivo y audiencia

¿Vender en línea, generar contactos, mostrar un portafolio? Cada objetivo cambia la estructura, el contenido y las métricas con las que vamos a medir el resultado.

## 2. Arquitectura y contenido

Ordenamos la información en un mapa del sitio simple y escribimos el contenido antes de diseñar: los textos definen el diseño, no al revés.

## 3. Diseño y prototipo

Trabajamos la identidad visual sobre un prototipo navegable, primero en móvil, para validar recorridos antes de desarrollar.

## 4. Desarrollo y lanzamiento

- Velocidad y buenas prácticas de SEO técnico
- Formularios conectados y medición desde el primer día
- Pruebas en distintos dispositivos antes de publicar

## 5. Medir y mejorar

Un sitio se lanza y se ajusta: con datos reales decidimos qué mejorar en cada iteración.`
  })
];

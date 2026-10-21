import type { MetadataRoute } from "next";
import { CAMPAIGNS } from "../campaigns/registry";
import { STUDIO_AREAS } from "../content/area-meta";
import { LAB_PROTOTYPES } from "../content/lab";
import { publicProjects } from "../content/projects";
import { getBlogPosts } from "../lib/blog/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl";
  return [
    { url: base },
    ...STUDIO_AREAS.map(({ href }) => ({ url: `${base}${href}` })),
    { url: `${base}/proyectos` },
    { url: `${base}/nosotros` },
    { url: `${base}/blog` },
    ...(await getBlogPosts()).map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.publishedAt
    })),
    { url: `${base}/contacto` },
    { url: `${base}/privacidad` },
    { url: `${base}/terminos` },
    { url: `${base}/lab` },
    ...publicProjects.map(({ slug }) => ({ url: `${base}/proyectos/${slug}` })),
    ...LAB_PROTOTYPES.map(({ slug }) => ({ url: `${base}/lab/${slug}` })),
    ...Object.keys(CAMPAIGNS).map((slug) => ({ url: `${base}/campanas/${slug}` }))
  ];
}

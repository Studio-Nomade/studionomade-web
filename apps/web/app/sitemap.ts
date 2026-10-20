import type { MetadataRoute } from "next";
import { CAMPAIGNS } from "../campaigns/registry";
import { LAB_PROTOTYPES } from "../content/lab";
import { publicProjects } from "../content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl";
  return [
    { url: base },
    { url: `${base}/areas/branding` },
    { url: `${base}/areas/architecture` },
    { url: `${base}/proyectos` },
    { url: `${base}/studio` },
    { url: `${base}/contacto` },
    { url: `${base}/privacidad` },
    { url: `${base}/terminos` },
    { url: `${base}/lab` },
    ...publicProjects.map(({ slug }) => ({ url: `${base}/proyectos/${slug}` })),
    ...LAB_PROTOTYPES.map(({ slug }) => ({ url: `${base}/lab/${slug}` })),
    ...Object.keys(CAMPAIGNS).map((slug) => ({ url: `${base}/campanas/${slug}` }))
  ];
}

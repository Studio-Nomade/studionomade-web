import type { MetadataRoute } from "next";
import { CAMPAIGNS } from "../campaigns/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studionomade.cl";
  return [
    { url: base },
    { url: `${base}/areas/branding` },
    { url: `${base}/areas/architecture` },
    ...Object.keys(CAMPAIGNS).map((slug) => ({ url: `${base}/campanas/${slug}` }))
  ];
}

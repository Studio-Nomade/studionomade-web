import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaPage } from "../../../components/areas/area-page";
import { faviconFor } from "../../../content/area-meta";
import { areas, isAreaSlug } from "../../../content/areas";

export function generateStaticParams() {
  return Object.keys(areas).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isAreaSlug(slug)) return {};

  const area = areas[slug];
  return {
    title: `${area.name} | Studio Nomade`,
    description: area.description,
    alternates: { canonical: `/areas/${area.slug}` },
    icons: faviconFor(area.slug)
  };
}

export default async function AreaRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isAreaSlug(slug)) notFound();
  const area = areas[slug];
  return (
    <div data-accent={area.accent}>
      <AreaPage area={area} />
    </div>
  );
}

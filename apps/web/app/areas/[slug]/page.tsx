import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaPage } from "../../../components/areas/area-page";
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
    title: `${area.title} | Studio Nomade`,
    description: area.what,
    alternates: { canonical: `/areas/${area.slug}` }
  };
}

export default async function AreaRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isAreaSlug(slug)) notFound();
  return <AreaPage area={areas[slug]} />;
}

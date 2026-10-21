import type { Metadata } from "next";
import { AREA_BY_SLUG } from "../../../content/area-meta";
import { notFound } from "next/navigation";
import { CasePage } from "../../../components/projects/case-page";
import { PublicPage } from "../../../components/public/public-shell";
import { getNextProject, getPublicProject, publicProjects } from "../../../content/projects";

export function generateStaticParams() {
  return publicProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getPublicProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} | Studio Nomade`,
    description: project.summary,
    alternates: { canonical: `/proyectos/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.cover.src, alt: project.cover.alt }]
    }
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getPublicProject((await params).slug);
  if (!project) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: project.cover.src,
    genre: AREA_BY_SLUG[project.area].name,
    creator: { "@type": "Organization", name: "Studio Nomade" },
    dateCreated: project.year
  };
  return (
    <PublicPage headerTone="light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <CasePage project={project} next={getNextProject(project.slug)} />
    </PublicPage>
  );
}

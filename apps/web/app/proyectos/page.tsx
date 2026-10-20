import type { Metadata } from "next";
import { ProjectIndex } from "../../components/projects/project-index";
import { PublicPage } from "../../components/public/public-shell";
import { publicProjects } from "../../content/projects";

export const metadata: Metadata = {
  title: "Proyectos | Studio Nomade",
  description: "Casos de branding, arquitectura y experiencias de marca de Studio Nomade.",
  alternates: { canonical: "/proyectos" }
};

export default function ProjectsPage() {
  return (
    <PublicPage headerTone="light">
      <ProjectIndex projects={publicProjects} />
    </PublicPage>
  );
}

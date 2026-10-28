import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { publicProjects } from "../../content/projects";
import { ProjectIndex } from "./project-index";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  }));
});

describe("ProjectIndex", () => {
  it("lista cada caso con una imagen, sigla, nombre, bajada y texto corto", () => {
    render(<ProjectIndex projects={publicProjects} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Proyectos");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(publicProjects.length);

    publicProjects.forEach((project, index) => {
      const item = items[index];
      const link = within(item).getByRole("link");
      expect(link).toHaveAttribute("href", `/proyectos/${project.slug}`);
      expect(item.querySelectorAll("img")).toHaveLength(1);
      expect(item.querySelector("img")).toHaveAttribute("src", project.cover.src);
      expect(within(item).getByRole("heading", { level: 2 })).toHaveTextContent(
        project.displayName
      );
      expect(within(item).getByText(project.tagline)).toBeInTheDocument();
      expect(within(item).getByText(project.excerpt)).toBeInTheDocument();
      expect(item).toHaveTextContent(project.areaCode);
    });
  });

  it("muestra la bajada con el formato «Nombre - servicio»", () => {
    render(<ProjectIndex projects={publicProjects} />);
    expect(screen.getByText("Nexa - Desarrollo de marca")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Cinnalove" })).toBeInTheDocument();
  });
});

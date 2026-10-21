import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_AREAS, HOME_HERO_SLIDES } from "../../content/home";
import { HomeHero } from "./home-hero";
import { HomeLanding } from "./home-landing";

// InstagramFeed es un Server Component asíncrono (API de Instagram): en los
// tests de render se reemplaza por su versión de respaldo síncrona.
vi.mock("./instagram-feed", () => ({
  InstagramFeed: () => <a href="https://www.instagram.com/studionomade_/">Ir al perfil</a>
}));

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HomeLanding", () => {
  it("mantiene el h1 y los titulares de sección", () => {
    render(<HomeLanding />);
    expect(screen.getByRole("heading", { level: 1, name: "Studio Nomade" })).toBeInTheDocument();
    for (const name of [
      "Creative Movement",
      "Áreas",
      "Agendemos una reunión",
      "Instagram",
      "Últimas publicaciones",
      "Contacto"
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("solo la primera imagen del hero es prioritaria (LCP)", () => {
    const { container } = render(<HomeLanding />);
    const carousel = container.querySelector('[aria-roledescription="carousel"]')!;
    const images = [...carousel.querySelectorAll("img")];
    expect(images).toHaveLength(HOME_HERO_SLIDES.length);
    expect(images[0]).not.toHaveAttribute("loading", "lazy");
    for (const image of images.slice(1)) expect(image).toHaveAttribute("loading", "lazy");
  });

  it("las cuatro áreas enlazan a su página con sigla, nombre e isologo", () => {
    const { container } = render(<HomeLanding />);
    const section = container.querySelector("#areas")!;
    const links = within(section as HTMLElement).getAllByRole("link");
    expect(links).toHaveLength(4);
    HOME_AREAS.forEach((area, index) => {
      const link = links[index];
      expect(link).toHaveAccessibleName(`Ver área ${area.name}`);
      expect(link).toHaveAttribute("href", `/areas/${area.slug}`);
      expect(link).toHaveTextContent(area.code);
      expect(link).toHaveTextContent(area.name);
      const sources = [...link.querySelectorAll("img")].map((img) => img.getAttribute("src"));
      expect(sources).toHaveLength(3);
      expect(sources.join(" ")).toContain(encodeURIComponent(area.symbol));
    });
  });

  it("Creative Movement lleva al equipo en /nosotros", () => {
    render(<HomeLanding />);
    expect(screen.getByRole("link", { name: "Conoce al equipo" })).toHaveAttribute(
      "href",
      "/nosotros"
    );
  });

  it("la home no tiene formulario: invita a /contacto y a agendar", () => {
    const { container } = render(<HomeLanding />);
    expect(container.querySelector("form")).toBeNull();
    expect(screen.getByRole("link", { name: "Cuéntanos tu proyecto" })).toHaveAttribute(
      "href",
      "/contacto"
    );
    expect(screen.getByRole("link", { name: "Agendar una videollamada" })).toHaveAttribute(
      "href",
      "/contacto#agenda"
    );
  });

  it("el CTA de reunión es magnético y lleva a la agenda", () => {
    render(<HomeLanding />);
    const cta = screen.getByRole("link", { name: "Agenda una reunión" });
    expect(cta).toHaveAttribute("href", "/contacto#agenda");
    expect(cta.closest("[data-cursor-magnetic]")).not.toBeNull();
  });

  it("ya no tiene sección de reel ni de oficinas con mapas", () => {
    render(<HomeLanding />);
    expect(screen.queryByRole("heading", { name: "Reel" })).toBeNull();
    expect(screen.queryByRole("link", { name: /Cómo llegar/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Ir al perfil" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/studionomade_/"
    );
  });
});

describe("HomeHero", () => {
  const first = HOME_HERO_SLIDES[0];
  const second = HOME_HERO_SLIDES[1];
  const pad = (value: number) => String(value).padStart(2, "0");

  it("es un carrusel accesible con una diapositiva visible", () => {
    mockReducedMotion(false);
    const { container } = render(<HomeHero slides={HOME_HERO_SLIDES} />);
    const carousel = screen.getByRole("region", { name: "Proyectos destacados" });
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    const slides = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides).toHaveLength(HOME_HERO_SLIDES.length);
    expect(slides[0]).toHaveAttribute(
      "aria-label",
      `1 de ${HOME_HERO_SLIDES.length}: ${first.title}`
    );
    expect(slides[0]).not.toHaveAttribute("aria-hidden");
    expect(slides[1]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("01").closest("p")).toHaveTextContent(
      `01 / ${pad(HOME_HERO_SLIDES.length)}`
    );
  });

  it("el botón «Ver proyecto» lleva la sigla del área y enlaza al caso", () => {
    mockReducedMotion(false);
    render(<HomeHero slides={HOME_HERO_SLIDES} />);
    const pill = screen.getByRole("link", { name: `Ver proyecto ${first.title}` });
    expect(pill).toHaveAttribute("href", `/proyectos/${first.slug}`);
    expect(pill).toHaveTextContent(first.code);
    expect(pill).toHaveTextContent(`Ver proyecto · ${first.title}`);
  });

  it("al completarse el progreso pasa a la siguiente diapositiva", () => {
    mockReducedMotion(false);
    const { container } = render(<HomeHero slides={HOME_HERO_SLIDES} />);
    const carousel = screen.getByRole("region", { name: "Proyectos destacados" });
    expect(carousel).toHaveAttribute("data-autoplay");
    const progress = screen
      .getByRole("link", { name: `Ver proyecto ${first.title}` })
      .querySelector("span")!;
    act(() => {
      fireEvent.animationEnd(progress);
    });
    expect(screen.getByRole("link", { name: `Ver proyecto ${second.title}` })).toHaveAttribute(
      "href",
      `/proyectos/${second.slug}`
    );
    expect(container.querySelectorAll('[aria-roledescription="slide"]')[1]).toHaveAttribute(
      "data-active"
    );
  });

  it("las flechas navegan en bucle y el botón de pausa detiene el progreso", () => {
    mockReducedMotion(false);
    render(<HomeHero slides={HOME_HERO_SLIDES} />);
    const last = HOME_HERO_SLIDES.at(-1)!;
    fireEvent.click(screen.getByRole("button", { name: "Proyecto anterior" }));
    expect(screen.getByRole("link", { name: `Ver proyecto ${last.title}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Proyecto siguiente" }));
    expect(screen.getByRole("link", { name: `Ver proyecto ${first.title}` })).toBeInTheDocument();
    const carousel = screen.getByRole("region", { name: "Proyectos destacados" });
    expect(carousel).not.toHaveAttribute("data-paused");
    fireEvent.click(screen.getByRole("button", { name: "Pausar presentación" }));
    expect(carousel).toHaveAttribute("data-paused");
    expect(screen.getByRole("button", { name: "Reanudar presentación" })).toBeInTheDocument();
  });

  it("con movimiento reducido no hay autoplay ni botón de pausa", () => {
    mockReducedMotion(true);
    render(<HomeHero slides={HOME_HERO_SLIDES} />);
    const carousel = screen.getByRole("region", { name: "Proyectos destacados" });
    expect(carousel).not.toHaveAttribute("data-autoplay");
    expect(screen.queryByRole("button", { name: "Pausar presentación" })).toBeNull();
  });

  it("acepta un video por diapositiva con su poster", () => {
    mockReducedMotion(true);
    const slides = [
      {
        ...first,
        video: { src: "/video/demo.mp4", poster: first.image.src, type: "video/mp4" as const }
      },
      second
    ];
    const { container } = render(<HomeHero slides={slides} />);
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("poster", first.image.src);
    expect(video.querySelector("source")).toHaveAttribute("src", "/video/demo.mp4");
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });
});

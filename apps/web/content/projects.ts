export type PublicProject = {
  slug: string;
  title: string;
  client: string;
  year: string;
  area: "branding" | "architecture";
  summary: string;
  challenge: string;
  strategy: string;
  result: string;
  cover: string;
  gallery: string[];
};

export const publicProjects: PublicProject[] = [
  {
    slug: "cinnalove",
    title: "CinnaLove",
    client: "CinnaLove",
    year: "2025",
    area: "branding",
    summary:
      "Una identidad cálida y flexible para una marca que convierte cada rollo en un gesto de cariño.",
    challenge:
      "Construir una marca reconocible, cercana y preparada para crecer en distintos formatos.",
    strategy:
      "Un sistema gráfico expresivo, modular y coherente desde el empaque hasta la comunicación digital.",
    result:
      "Una identidad diferenciada, memorable y lista para acompañar la expansión de la marca.",
    cover: "/home/branding-project-1.webp",
    gallery: [
      "/home/cinnalove-hero-1.webp",
      "/home/cinnalove-banner-1.webp",
      "/home/branding-project-3.webp"
    ]
  },
  {
    slug: "jaecoo-7",
    title: "Jaecoo 7",
    client: "Jaecoo",
    year: "2025",
    area: "architecture",
    summary:
      "Una experiencia espacial inmersiva para presentar un nuevo modelo en un contexto de alta exposición.",
    challenge:
      "Transformar atributos técnicos y de marca en una experiencia clara, atractiva y recorrible.",
    strategy:
      "Diseño espacial, iluminación y soportes audiovisuales integrados en un único lenguaje.",
    result:
      "Un lanzamiento consistente con la marca y capaz de conectar el producto con sus audiencias.",
    cover: "/home/arch-gallery-1.webp",
    gallery: ["/home/arch-1.webp", "/home/arch-gallery-2.webp", "/home/arch-gallery-3.webp"]
  }
];

export function getPublicProject(slug: string) {
  return publicProjects.find((project) => project.slug === slug);
}

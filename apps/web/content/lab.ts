export type LabPrototype = {
  slug: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  industry: string;
  solution: string;
  maturity: "concepto" | "prototipo";
};

export const LAB_PROTOTYPES: LabPrototype[] = [
  {
    slug: "kinetic-type",
    title: "Kinetic Type",
    description: "Ensayo de ritmo y escala tipográfica para narrativas digitales.",
    version: "1.0.0",
    tags: ["tipografía", "movimiento"],
    industry: "creativa",
    solution: "comunicación",
    maturity: "prototipo"
  },
  {
    slug: "chromatic-grid",
    title: "Chromatic Grid",
    description: "Sistema generativo de color y composición modular.",
    version: "1.0.0",
    tags: ["color", "sistema"],
    industry: "marcas",
    solution: "identidad",
    maturity: "concepto"
  },
  {
    slug: "spatial-notes",
    title: "Spatial Notes",
    description: "Prototipo editorial para registrar ideas espaciales.",
    version: "1.0.0",
    tags: ["arquitectura", "editorial"],
    industry: "espacios",
    solution: "experiencia",
    maturity: "prototipo"
  }
];

export function getLabPrototype(slug: string) {
  return LAB_PROTOTYPES.find((prototype) => prototype.slug === slug);
}

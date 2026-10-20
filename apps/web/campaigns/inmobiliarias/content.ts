import { campaignContentSchema } from "@studionomade/content-schema";

export const inmobiliariasContent = campaignContentSchema.parse({
  hero: {
    eyebrow: "Branding y comunicación para proyectos inmobiliarios",
    highlight: "INMO",
    title: "BILIARIAS"
  },
  claims: [
    { text: "INDUSTRIA", mark: "circle" },
    { text: "DESTAQUE", mark: "fill" },
    { text: "PUEDE PERDERSE", mark: "fill" },
    { text: "COMO TODOS.", mark: "circle" },
    { text: "Un proyecto.", mark: "none" },
    { text: "Una dirección.", mark: "none" },
    { text: "Una marca difícil de confundir.", mark: "none" }
  ],
  steps: ["Definimos su diferencia.", "Construimos su identidad.", "Conectamos su comunicación."],
  footline: ["Estrategia", "Identidad", "Comunicación", "Venta"],
  form: {
    heading: "Cuéntanos tu proyecto y conversemos sobre cómo darle una dirección propia.",
    badge: "CONTACTO",
    submitLabel: "Quiero conversar sobre mi proyecto",
    successMessage: "Gracias. Te contactaremos para coordinar una primera conversación.",
    // El texto de consentimiento no vive aquí: sale del registro versionado
    // (content/legal/consentimientos.ts) según `consentVersion` del registry.
    // Los `value` deben pertenecer a PROJECT_STAGES (@studionomade/validation).
    stages: [
      { value: "idea", label: "Idea" },
      { value: "en_desarrollo", label: "En desarrollo" },
      { value: "en_venta", label: "En venta" }
    ]
  }
});

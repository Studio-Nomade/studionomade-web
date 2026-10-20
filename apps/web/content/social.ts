import type { FooterSocial } from "@studionomade/ui";

/**
 * Redes de Studio Nomade: fuente única para footers del sitio y de campañas.
 *
 * TODO-verificar: confirmar con el equipo que estas URLs son los perfiles
 * oficiales antes de pautar. Un valor vacío oculta el ícono.
 */
export const SOCIAL_LINKS: Record<FooterSocial["kind"], string> = {
  linkedin: "https://www.linkedin.com/company/studio-nomade/",
  vimeo: "",
  instagram: "https://www.instagram.com/studionomade/",
  email: "mailto:contact@studionomade.cl"
};

const ORDER: Array<FooterSocial["kind"]> = ["linkedin", "vimeo", "instagram", "email"];

export function footerSocialLinks(links: Record<FooterSocial["kind"], string> = SOCIAL_LINKS) {
  return ORDER.flatMap((kind): FooterSocial[] => {
    const href = links[kind].trim();
    return href && href !== "#" ? [{ kind, href }] : [];
  });
}

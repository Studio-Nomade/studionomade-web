import type { FooterSocial } from "@studionomade/ui";

type SocialKind = Exclude<FooterSocial["kind"], "whatsapp" | "email">;

/**
 * Redes oficiales de Studio Nomade (confirmadas por dirección el 2026-10-21):
 * fuente única para los footers del sitio y de campañas. Un valor vacío oculta
 * el ícono.
 */
export const SOCIAL_LINKS: Record<SocialKind, string> = {
  instagram: "https://www.instagram.com/studionomade_/",
  behance: "https://www.behance.net/studionomade_",
  vimeo: "https://vimeo.com/studionomadee",
  linkedin: "https://www.linkedin.com/company/studionomade",
  threads: "https://www.threads.com/@studionomade_"
};

const ORDER: SocialKind[] = ["instagram", "behance", "vimeo", "linkedin", "threads"];

export const SOCIAL_NAMES: Record<SocialKind, string> = {
  instagram: "Instagram",
  behance: "Behance",
  vimeo: "Vimeo",
  linkedin: "LinkedIn",
  threads: "Threads"
};

export function footerSocialLinks(links: Record<SocialKind, string> = SOCIAL_LINKS) {
  return ORDER.flatMap((kind): FooterSocial[] => {
    const href = links[kind].trim();
    return href && href !== "#" ? [{ kind, href }] : [];
  });
}

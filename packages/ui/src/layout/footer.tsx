import type { ReactNode } from "react";
import { InstagramIcon } from "../icons/instagram";
import { LinkedInIcon } from "../icons/linkedin";
import { VimeoIcon } from "../icons/vimeo";
import styles from "./footer.module.css";
export interface FooterColumn {
  title: string;
  items: Array<{ label: ReactNode; href?: string }>;
}
export interface FooterSocial {
  kind: "linkedin" | "vimeo" | "instagram" | "email";
  href: string;
}
export interface FooterProps {
  tagline?: string;
  cities?: string;
  /** Logo como imagen simple. Para `next/image` u otro medio, usa `logo`. */
  logoSrc?: string;
  /** Slot de logo (tiene prioridad sobre `logoSrc`). */
  logo?: ReactNode;
  columns?: FooterColumn[];
  social?: FooterSocial[];
  /** Enlaces legales junto al texto legal (Privacidad, Términos). */
  legalLinks?: Array<{ label: string; href: string }>;
  /** Texto legal. Por defecto, "© {año} Studio Nomade - Todos los derechos reservados". */
  legal?: string;
  /**
   * Revelado fijo: en escritorio el footer queda fijo detrás del contenido y se
   * descubre al final del scroll. El contenido que lo precede debe tener fondo
   * opaco y `position: relative` con `z-index: 1` (lo hace `PublicShell`).
   */
  reveal?: boolean;
}
const icons = { linkedin: LinkedInIcon, vimeo: VimeoIcon, instagram: InstagramIcon };
const socialNames = {
  linkedin: "LinkedIn",
  vimeo: "Vimeo",
  instagram: "Instagram",
  email: "Correo"
};
/**
 * Footer público según Figma: dos reglas horizontales que enmarcan la firma
 * ("Nos movemos en manada · Santiago | Madrid"), logo grande (258px a 1440),
 * grilla de columnas (Studio, Contacto, Redes…) y línea legal con el año.
 */
export function Footer({
  tagline = "Nos movemos en manada",
  cities = "Santiago | Madrid",
  logoSrc,
  logo,
  columns = [],
  social = [],
  legalLinks = [],
  legal = `© ${new Date().getFullYear()} Studio Nomade - Todos los derechos reservados`,
  reveal = false
}: FooterProps) {
  const brand =
    logo ?? (logoSrc ? <img className={styles.logo} src={logoSrc} alt="Studio Nomade" /> : null);
  return (
    <footer className={styles.footer} data-reveal-fixed={reveal || undefined}>
      <div className={styles.inner}>
        <div className={styles.rule} />
        <p className={styles.tagline}>
          <span>{tagline}</span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span>{cities}</span>
        </p>
        <div className={styles.rule} />
        <div className={styles.grid} data-columns={columns.length}>
          <div className={styles.brand}>{brand}</div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className={styles.title}>{column.title}</h2>
              <ul className={styles.list}>
                {column.items.map((item, index) => (
                  <li key={index}>
                    {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          <p className={styles.legal}>
            <span>{legal}</span>
            {legalLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </p>
          {social.length ? (
            <div className={styles.social}>
              {social.map((item) => {
                const Icon = item.kind === "email" ? null : icons[item.kind];
                return (
                  <a
                    key={`${item.kind}-${item.href}`}
                    href={item.href}
                    aria-label={socialNames[item.kind]}
                  >
                    {Icon ? <Icon /> : "@"}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

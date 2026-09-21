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
  logoSrc?: string;
  columns?: FooterColumn[];
  social?: FooterSocial[];
  legal?: string;
}
const icons = { linkedin: LinkedInIcon, vimeo: VimeoIcon, instagram: InstagramIcon };
export function Footer({
  tagline = "Nos movemos en manada",
  cities = "Santiago | Madrid",
  logoSrc,
  columns = [],
  social = [],
  legal = "© 2024 Studio Nomade - Todos los derechos reservados"
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.tagline}>
          {tagline}
          <br />
          {cities}
        </div>
        <div className={styles.rule} />
        <div className={styles.grid}>
          <div>{logoSrc && <img className={styles.logo} src={logoSrc} alt="Studio Nomade" />}</div>
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
          <span>{legal}</span>
          <div className={styles.social}>
            {social.map((item) => {
              const Icon = item.kind === "email" ? null : icons[item.kind];
              return (
                <a key={`${item.kind}-${item.href}`} href={item.href} aria-label={item.kind}>
                  {Icon ? <Icon /> : "@"}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

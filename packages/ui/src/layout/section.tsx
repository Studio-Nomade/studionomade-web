import type { HTMLAttributes, ReactNode } from "react";
import styles from "./section.module.css";
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: "page" | "alt" | "band" | "warm" | "invert" | "invertSoft";
  tight?: boolean;
  bleed?: boolean;
  accent?: string;
  children?: ReactNode;
}
export function Section({
  tone = "page",
  tight = false,
  bleed = false,
  children,
  accent,
  ...rest
}: SectionProps) {
  return (
    <section
      className={styles.section}
      data-tone={tone}
      data-tight={tight || undefined}
      data-accent={accent}
      {...rest}
    >
      <div className={styles.inner} data-bleed={bleed || undefined}>
        {children}
      </div>
    </section>
  );
}

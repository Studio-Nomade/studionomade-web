"use client";
import type { ComponentPropsWithRef } from "react";
import styles from "./menu-toggle.module.css";
export interface MenuToggleProps extends Omit<ComponentPropsWithRef<"button">, "style"> {
  label?: string;
  invert?: boolean;
  /** Estado del menú que controla: fija `aria-expanded` y cruza las dos líneas. */
  expanded?: boolean;
}
export function MenuToggle({
  label = "Menú",
  invert = false,
  expanded,
  type = "button",
  ...rest
}: MenuToggleProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.toggle, rest.className].filter(Boolean).join(" ")}
      data-invert={invert || undefined}
      data-expanded={expanded || undefined}
      aria-expanded={expanded}
    >
      {label}
      <span className={styles.mark} aria-hidden="true">
        <i />
        <i />
      </span>
    </button>
  );
}

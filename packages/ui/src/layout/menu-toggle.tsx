"use client";
import type { ButtonHTMLAttributes } from "react";
import styles from "./menu-toggle.module.css";
export interface MenuToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  label?: string;
  invert?: boolean;
}
export function MenuToggle({
  label = "Menú",
  invert = false,
  type = "button",
  ...rest
}: MenuToggleProps) {
  return (
    <button {...rest} type={type} className={styles.toggle} data-invert={invert || undefined}>
      {label}
      <span className={styles.mark} aria-hidden="true">
        <i />
        <i />
      </span>
    </button>
  );
}

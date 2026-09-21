import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import styles from "./button.module.css";

export interface ButtonProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  variant?: "outline" | "solid" | "ghost" | "invert";
  size?: "sm" | "md" | "lg";
  shape?: "pill" | "square";
  accent?: boolean;
  disabled?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
}

export function Button({
  variant = "outline",
  size = "md",
  shape = "pill",
  accent = false,
  href,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const common = {
    className: styles.button,
    "data-variant": variant,
    "data-size": size,
    "data-shape": shape,
    "data-accented": accent || undefined
  };

  if (href) {
    const anchorSafe = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...anchorSafe} {...common} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      {...common}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

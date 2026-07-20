import type { AnchorHTMLAttributes } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function Link(props: LinkProps) {
  return <a {...props} />;
}

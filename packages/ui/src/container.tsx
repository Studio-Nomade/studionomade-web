import type { HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: ContainerProps) {
  const classes = ["sn-container", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}

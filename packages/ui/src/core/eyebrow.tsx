import type { ElementType, ReactNode } from "react";
import styles from "./eyebrow.module.css";
export interface EyebrowProps {
  invert?: boolean;
  as?: ElementType;
  children?: ReactNode;
}
export function Eyebrow({ children, invert = false, as: Tag = "div" }: EyebrowProps) {
  return (
    <Tag className={styles.eyebrow} data-invert={invert || undefined}>
      {children}
    </Tag>
  );
}

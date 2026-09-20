import type { HTMLAttributes } from "react";
import styles from "./mark.module.css";
export type MarkProps = HTMLAttributes<HTMLSpanElement>;
export function Mark({ children, ...rest }: MarkProps) {
  return (
    <span {...rest} className={styles.mark}>
      {children}
    </span>
  );
}

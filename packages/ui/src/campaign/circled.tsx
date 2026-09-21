import type { HTMLAttributes } from "react";
import styles from "./circled.module.css";
export type CircledProps = HTMLAttributes<HTMLSpanElement>;
export function Circled({ children, ...rest }: CircledProps) {
  return (
    <span {...rest} className={styles.circled}>
      {children}
    </span>
  );
}

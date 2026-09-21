import styles from "./rule.module.css";
export interface RuleProps {
  variant?: "full" | "short";
  invert?: boolean;
  align?: "left" | "center";
}
export function Rule({ variant = "full", invert = false, align = "center" }: RuleProps) {
  return (
    <div
      aria-hidden="true"
      className={styles.rule}
      data-variant={variant}
      data-invert={invert || undefined}
      data-align={align}
    />
  );
}

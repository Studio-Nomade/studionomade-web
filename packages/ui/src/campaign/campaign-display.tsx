import type { HTMLAttributes } from "react";
import styles from "./campaign-display.module.css";
export interface CampaignDisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3;
}
export function CampaignDisplay({ level = 2, children, ...rest }: CampaignDisplayProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  return (
    <Tag {...rest} className={styles.display} data-level={level}>
      {children}
    </Tag>
  );
}

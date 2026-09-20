import type { CSSProperties, ReactNode } from "react";
import { Mark } from "./mark";
import styles from "./campaign-hero.module.css";
export interface CampaignHeroProps {
  eyebrow?: string;
  highlight?: string;
  title?: ReactNode;
  texture?: ReactNode;
  art?: ReactNode;
  height?: string;
}
export function CampaignHero({
  eyebrow,
  highlight,
  title,
  texture,
  art,
  height
}: CampaignHeroProps) {
  return (
    <div
      className={styles.hero}
      style={height ? ({ "--sn-hero-height": height } as CSSProperties) : undefined}
    >
      {texture && <div className={styles.texture}>{texture}</div>}
      {art && <div className={styles.art}>{art}</div>}
      <div className={styles.inner}>
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h1 className={styles.title}>
          {highlight && <Mark>{highlight}</Mark>}
          {title}
        </h1>
      </div>
    </div>
  );
}

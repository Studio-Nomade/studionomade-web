import type { ReactNode } from "react";
import styles from "./campaign-cta.module.css";
export interface CampaignCTAProps {
  title?: ReactNode;
  body?: ReactNode;
  label?: string;
  note?: string;
  texture?: ReactNode;
  art?: ReactNode;
  href?: string;
  onClick?: () => void;
}
export function CampaignCTA({
  title,
  body,
  label,
  note,
  texture,
  art,
  href = "#form",
  onClick
}: CampaignCTAProps) {
  return (
    <div className={styles.cta}>
      {texture && <div className={styles.texture}>{texture}</div>}
      {art && <div className={styles.art}>{art}</div>}
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>
        {body && <p className={styles.body}>{body}</p>}
        {label &&
          (onClick ? (
            <button className={styles.action} type="button" onClick={onClick}>
              {label}
            </button>
          ) : (
            <a className={styles.action} href={href}>
              {label}
            </a>
          ))}
        {note && <div className={styles.note}>{note}</div>}
      </div>
    </div>
  );
}

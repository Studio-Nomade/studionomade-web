import type { CSSProperties } from "react";
import styles from "./step-flow.module.css";
export interface StepFlowProps {
  steps?: string[];
  footline?: string[];
}
export function StepFlow({ steps = [], footline }: StepFlowProps) {
  return (
    <div>
      <div className={styles.steps} style={{ "--sn-step-count": steps.length } as CSSProperties}>
        {steps.map((step, index) => (
          <div className={styles.step} key={step}>
            <div className={styles.number}>{String(index + 1).padStart(2, "0")}</div>
            <div className={styles.label}>{step}</div>
          </div>
        ))}
      </div>
      {footline && (
        <div className={styles.footline}>
          {footline.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      )}
    </div>
  );
}

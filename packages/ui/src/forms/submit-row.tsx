"use client";
import { useFormStatus } from "react-dom";
import { Button } from "../core/button";
import styles from "./submit-row.module.css";
export interface SubmitRowProps {
  label?: string;
  pendingLabel?: string;
  note?: string;
  variant?: "outline" | "solid";
  invert?: boolean;
  accent?: boolean;
}
export function SubmitRow({
  label = "Enviar",
  pendingLabel = "Enviando…",
  note,
  variant = "outline",
  invert = false,
  accent = false
}: SubmitRowProps) {
  const { pending } = useFormStatus();
  return (
    <div className={styles.row} data-invert={invert || undefined}>
      <Button
        type="submit"
        variant={invert ? "invert" : variant}
        accent={accent}
        size="lg"
        disabled={pending}
      >
        {pending ? pendingLabel : label}
      </Button>
      {note && <span>{note}</span>}
    </div>
  );
}

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./checkbox.module.css";
export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<"input">, "className" | "style" | "type"> {
  label: ReactNode;
  name: string;
  hint?: string;
  error?: string;
  invert?: boolean;
}
export function Checkbox({
  label,
  name,
  id = `f-${name}`,
  hint,
  error,
  invert = false,
  required,
  ...rest
}: CheckboxProps) {
  const describedBy =
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.field} data-invert={invert || undefined}>
      <label htmlFor={id}>
        <input
          {...rest}
          id={id}
          name={name}
          type="checkbox"
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
        />
        <span>{label}</span>
      </label>
      {error && (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      )}
      {hint && (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}

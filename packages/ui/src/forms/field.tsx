import type { ComponentPropsWithoutRef } from "react";
import styles from "./field.module.css";
export interface FieldProps extends Omit<ComponentPropsWithoutRef<"input">, "className" | "style"> {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  invert?: boolean;
}
export function Field({
  label,
  name,
  id = `f-${name}`,
  hint,
  error,
  invert = false,
  required,
  ...rest
}: FieldProps) {
  const describedBy =
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div
      className={styles.field}
      data-invert={invert || undefined}
      data-error={Boolean(error) || undefined}
    >
      <label htmlFor={id}>
        {label}
        {required && " *"}
      </label>
      <input
        {...rest}
        id={id}
        name={name}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
      />
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

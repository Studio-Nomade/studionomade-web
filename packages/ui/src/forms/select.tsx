import type { ComponentPropsWithoutRef } from "react";
import styles from "./select.module.css";
export interface SelectOption {
  value: string;
  label: string;
}
export interface SelectProps
  extends Omit<ComponentPropsWithoutRef<"select">, "className" | "style"> {
  label: string;
  name: string;
  options?: Array<SelectOption | string>;
  placeholder?: string;
  hint?: string;
  error?: string;
  invert?: boolean;
}
export function Select({
  label,
  name,
  id = `f-${name}`,
  options = [],
  placeholder = "Selecciona una opción",
  hint,
  error,
  invert = false,
  required,
  ...rest
}: SelectProps) {
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
      <select
        {...rest}
        id={id}
        name={name}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        defaultValue={rest.defaultValue ?? ""}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          );
        })}
      </select>
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

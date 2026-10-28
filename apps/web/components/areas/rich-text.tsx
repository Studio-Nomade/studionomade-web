import { Fragment } from "react";
import type { RichText } from "../../content/areas";

/**
 * Pinta un `RichText`: los tramos destacados van en `<strong>` y cada sección
 * decide su peso (Bold en la cita, SemiBold en la nota, Regular en Metodología).
 */
export function RichTextView({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, index) =>
        typeof part === "string" ? (
          <Fragment key={index}>{part}</Fragment>
        ) : (
          <strong key={index}>{part.strong}</strong>
        )
      )}
    </>
  );
}

import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Taxonomía de errores de datos.
 *
 * El objetivo es que ninguna capa superior tenga que interpretar códigos de
 * Postgres, y que el cliente **nunca** reciba detalles internos: el mensaje
 * público es genérico y el diagnóstico viaja en `detail`, que solo se registra.
 */

export type DataErrorCode =
  | "not_found"
  | "conflict"
  | "forbidden"
  | "validation"
  | "infrastructure";

const STATUS: Record<DataErrorCode, number> = {
  not_found: 404,
  conflict: 409,
  forbidden: 403,
  validation: 422,
  infrastructure: 500
};

const PUBLIC_MESSAGE: Record<DataErrorCode, string> = {
  not_found: "No encontramos lo que buscabas.",
  conflict: "Ya existe un registro con esos datos.",
  forbidden: "No tienes permisos para realizar esta acción.",
  validation: "Los datos enviados no son válidos.",
  infrastructure: "No pudimos completar la operación. Inténtalo de nuevo."
};

export class DataError extends Error {
  readonly code: DataErrorCode;
  readonly status: number;
  /** Diagnóstico para el log del servidor. Nunca se envía al cliente. */
  readonly detail?: string;

  constructor(code: DataErrorCode, detail?: string, options?: { cause?: unknown }) {
    super(PUBLIC_MESSAGE[code], options);
    this.name = "DataError";
    this.code = code;
    this.status = STATUS[code];
    this.detail = detail;
  }
}

export function isDataError(error: unknown): error is DataError {
  return error instanceof DataError;
}

/**
 * Traduce un error de PostgREST/Postgres a la taxonomía.
 *
 * Nota sobre RLS: cuando una política deniega una escritura, PostgREST devuelve
 * `42501`. Una lectura denegada por RLS no da error, simplemente devuelve cero
 * filas — por eso `not_found` y `forbidden` pueden ser indistinguibles en lectura,
 * y eso es deseable: no revela la existencia de recursos ajenos.
 */
export function mapPostgrestError(error: PostgrestError): DataError {
  const detail = `${error.code ?? "sin código"}: ${error.message}`;

  switch (error.code) {
    case "PGRST116": // cero filas con .single()
      return new DataError("not_found", detail, { cause: error });
    case "23505": // unique_violation
    case "23503": // foreign_key_violation
      return new DataError("conflict", detail, { cause: error });
    case "42501": // insufficient_privilege — RLS denegó la escritura
      return new DataError("forbidden", detail, { cause: error });
    case "23514": // check_violation
    case "23502": // not_null_violation
    case "22P02": // invalid_text_representation
      return new DataError("validation", detail, { cause: error });
    default:
      return new DataError("infrastructure", detail, { cause: error });
  }
}

/** Respuesta segura para el cliente. */
export function toPublicDataError(error: DataError): { code: DataErrorCode; message: string } {
  return { code: error.code, message: error.message };
}

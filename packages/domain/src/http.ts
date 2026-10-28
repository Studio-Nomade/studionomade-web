import { AuthError, isAuthError } from "@studionomade/auth";
import { DataError, isDataError } from "@studionomade/database";

import type { Logger } from "./logging";

/**
 * Único punto donde un error se convierte en respuesta HTTP.
 *
 * Garantiza dos cosas: que el cliente nunca vea un stack ni un mensaje de
 * Postgres, y que todo error quede registrado con su diagnóstico interno.
 */

export interface HttpErrorBody {
  readonly status: number;
  readonly body: { readonly code: string; readonly message: string; readonly requestId: string };
}

const UNEXPECTED = {
  code: "internal_error",
  message: "No pudimos completar la operación. Inténtalo de nuevo."
} as const;

export function toHttpError(error: unknown, logger: Logger, requestId: string): HttpErrorBody {
  if (isAuthError(error) || isDataError(error)) {
    const typed: AuthError | DataError = error;

    // 4xx esperados: se registran como warn, no como error.
    logger.warn("request.rejected", {
      code: typed.code,
      status: typed.status,
      detail: typed.detail ?? null
    });

    return {
      status: typed.status,
      body: { code: typed.code, message: typed.message, requestId }
    };
  }

  logger.error("request.failed", {
    detail: error instanceof Error ? error.message : String(error)
  });

  return { status: 500, body: { ...UNEXPECTED, requestId } };
}

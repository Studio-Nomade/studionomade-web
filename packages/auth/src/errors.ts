/**
 * Taxonomía de errores de autenticación y autorización.
 *
 * Los mensajes son deliberadamente genéricos: nunca revelan si un correo existe,
 * si está en la allowlist o qué rol le faltaría al usuario. El detalle útil va al
 * log estructurado del servidor, no a la respuesta.
 */

export type AuthErrorCode =
  | "no_session"
  | "not_allowlisted"
  | "no_profile"
  | "forbidden";

const STATUS: Record<AuthErrorCode, number> = {
  no_session: 401,
  not_allowlisted: 403,
  no_profile: 403,
  forbidden: 403
};

const PUBLIC_MESSAGE: Record<AuthErrorCode, string> = {
  no_session: "Necesitas iniciar sesión para continuar.",
  not_allowlisted: "Esta cuenta no tiene acceso al panel de Studio Nomade.",
  no_profile: "Esta cuenta no tiene acceso al panel de Studio Nomade.",
  forbidden: "No tienes permisos para realizar esta acción."
};

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;
  /** Detalle para el log del servidor. Nunca se envía al cliente. */
  readonly detail?: string;

  constructor(code: AuthErrorCode, detail?: string) {
    super(PUBLIC_MESSAGE[code]);
    this.name = "AuthError";
    this.code = code;
    this.status = STATUS[code];
    this.detail = detail;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/** Respuesta segura para el cliente: código y mensaje público, sin `detail`. */
export function toPublicError(error: AuthError): { code: AuthErrorCode; message: string } {
  return { code: error.code, message: error.message };
}

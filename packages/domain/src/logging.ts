/**
 * Logging estructurado server-side, con correlación por request.
 *
 * Reglas:
 * - Salida JSON en una línea: legible por cualquier agregador sin parser propio.
 * - **Nunca PII**: ni correos, ni teléfonos, ni IPs, ni nombres. Se registran
 *   identificadores opacos (uuid de usuario, id de entidad).
 * - Los errores se registran con su `detail` interno; lo que viaja al cliente es
 *   solo el mensaje público de la taxonomía.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  readonly requestId: string;
  readonly userId?: string;
  readonly route?: string;
}

export interface LogFields {
  readonly [key: string]: string | number | boolean | null | undefined;
}

/** Claves que nunca deben registrarse, por si alguien las pasa por descuido. */
const FORBIDDEN_KEYS = new Set([
  "email",
  "correo",
  "phone",
  "telefono",
  "ip",
  "name",
  "nombre",
  "password",
  "token",
  "secret",
  "authorization"
]);

function sanitize(fields: LogFields): LogFields {
  const safe: Record<string, string | number | boolean | null | undefined> = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[FORBIDDEN_KEYS.has(key.toLowerCase()) ? `${key}_omitido` : key] = FORBIDDEN_KEYS.has(
      key.toLowerCase()
    )
      ? true
      : value;
  }
  return safe;
}

export interface Logger {
  debug(event: string, fields?: LogFields): void;
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
  child(extra: Partial<LogContext>): Logger;
}

export type LogSink = (line: string) => void;

export function createLogger(
  context: LogContext,
  sink: LogSink = (line) => console.log(line)
): Logger {
  const emit = (level: LogLevel, event: string, fields: LogFields = {}) => {
    sink(
      JSON.stringify({
        level,
        event,
        time: new Date().toISOString(),
        ...context,
        ...sanitize(fields)
      })
    );
  };

  return {
    debug: (event, fields) => emit("debug", event, fields),
    info: (event, fields) => emit("info", event, fields),
    warn: (event, fields) => emit("warn", event, fields),
    error: (event, fields) => emit("error", event, fields),
    child: (extra) => createLogger({ ...context, ...extra }, sink)
  };
}

/** Identificador de correlación. `crypto.randomUUID` existe en Node 20+ y en Edge. */
export function newRequestId(): string {
  return crypto.randomUUID();
}

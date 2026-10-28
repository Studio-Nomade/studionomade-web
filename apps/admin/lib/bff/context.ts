import "server-only";

import { requireAdminAccess, type AuthorizedContext } from "@studionomade/auth";
import { createPageRepository } from "@studionomade/database";
import { createLogger, createPageService, newRequestId, type Logger } from "@studionomade/domain";

import { readAdminServerEnvironment } from "../env";
import { createAdminServerClient } from "../supabase-server";

/**
 * Construye el contexto de una petición del BFF: identidad verificada, acceso
 * efectivo, logger correlacionado y servicios de dominio ya cableados.
 *
 * Todo lo que pase por aquí cumple, por construcción, el orden del patrón:
 * validar → autorizar → ejecutar → registrar.
 */

export interface BffContext {
  readonly requestId: string;
  readonly logger: Logger;
  readonly auth: AuthorizedContext;
  readonly pages: ReturnType<typeof createPageService>;
}

export async function createBffContext(route: string): Promise<BffContext> {
  const requestId = newRequestId();
  const baseLogger = createLogger({ requestId, route });

  const client = await createAdminServerClient();
  const { allowlist } = readAdminServerEnvironment();

  // Lanza AuthError si no hay sesión, el correo no está en la allowlist o el
  // usuario no tiene ningún rol activo.
  const auth = await requireAdminAccess(client, allowlist);

  const logger = baseLogger.child({ userId: auth.user.id });

  return {
    requestId,
    logger,
    auth,
    pages: createPageService({
      repository: createPageRepository(client),
      access: auth.access,
      logger
    })
  };
}

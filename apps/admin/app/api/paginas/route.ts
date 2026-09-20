import { toHttpError } from "@studionomade/domain";
import { listPagesQuerySchema } from "@studionomade/validation";
import { NextResponse, type NextRequest } from "next/server";

import { createBffContext } from "../../../lib/bff/context";

/**
 * PATRÓN DE REFERENCIA — Route Handler del BFF.
 *
 * Orden obligatorio, y en este orden:
 *   1. Validar la entrada con zod (nunca confiar en la query string).
 *   2. Construir el contexto, que autentica y autoriza.
 *   3. Delegar en el servicio de dominio. Aquí NO hay reglas de negocio ni SQL.
 *   4. Mapear cualquier error con `toHttpError`, que registra y devuelve una
 *      respuesta sin detalles internos.
 *
 * El `requestId` se devuelve siempre para poder correlacionar lo que ve el
 * usuario con lo que quedó en el log.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Validación de entrada.
  const parsed = listPagesQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { code: "validation", message: "Los parámetros de la consulta no son válidos." },
      { status: 422 }
    );
  }

  let context;
  try {
    // 2. Autenticación + autorización.
    context = await createBffContext("GET /api/paginas");
  } catch (error) {
    const { status, body } = toHttpError(
      error,
      // Sin contexto todavía: logger mínimo para no perder el rechazo.
      (await import("@studionomade/domain")).createLogger({ requestId: "pre-auth" }),
      "pre-auth"
    );
    return NextResponse.json(body, { status });
  }

  try {
    // 3. Dominio.
    const result = await context.pages.list(parsed.data);

    return NextResponse.json(
      { ...result, requestId: context.requestId },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    // 4. Mapeo de errores.
    const { status, body } = toHttpError(error, context.logger, context.requestId);
    return NextResponse.json(body, { status });
  }
}

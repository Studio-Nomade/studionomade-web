"use server";

import { toHttpError } from "@studionomade/domain";
import { createPageSchema } from "@studionomade/validation";
import { revalidatePath } from "next/cache";

import { createBffContext } from "./context";

/**
 * PATRÓN DE REFERENCIA — Server Action del BFF.
 *
 * Mismo orden que el Route Handler: validar → autorizar → dominio → mapear error.
 *
 * Diferencias propias de una Server Action:
 *   - La entrada llega como `FormData`, así que se convierte antes de validar.
 *   - No se lanza el error: se devuelve un resultado discriminado, para que el
 *     formulario pueda pintar el mensaje sin romper la navegación y para que la
 *     acción siga funcionando **sin JavaScript**.
 *   - Se invalida la caché de la ruta afectada tras escribir.
 */

export type ActionResult<T> =
  | { readonly ok: true; readonly data: T; readonly requestId: string }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
      readonly requestId: string;
    };

export async function createPageAction(
  _previous: unknown,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = createPageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    status: formData.get("status") || undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues[0]?.message ?? "Los datos enviados no son válidos.",
      requestId: "sin-contexto"
    };
  }

  let context;
  try {
    context = await createBffContext("action createPage");
  } catch (error) {
    const { createLogger } = await import("@studionomade/domain");
    const { body } = toHttpError(error, createLogger({ requestId: "pre-auth" }), "pre-auth");
    return { ok: false, code: body.code, message: body.message, requestId: body.requestId };
  }

  try {
    const page = await context.pages.create(parsed.data);
    revalidatePath("/");

    return {
      ok: true,
      data: { id: page.id, slug: page.slug },
      requestId: context.requestId
    };
  } catch (error) {
    const { body } = toHttpError(error, context.logger, context.requestId);
    return { ok: false, code: body.code, message: body.message, requestId: body.requestId };
  }
}

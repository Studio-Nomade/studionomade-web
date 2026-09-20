import { z } from "zod";

/**
 * Esquemas de entrada reutilizables.
 *
 * Toda entrada que llegue al BFF se valida aquí antes de tocar el dominio. El
 * criterio es restrictivo: se rechaza lo que no encaja en vez de intentar
 * arreglarlo.
 */

export const contentStatusSchema = z.enum(["borrador", "revision", "publicado", "archivado"]);

export const slugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo admite minúsculas, números y guiones");

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export const listPagesQuerySchema = paginationSchema.extend({
  status: contentStatusSchema.optional(),
  // Se acota la búsqueda para que no sirva como vector de carga.
  search: z.string().trim().min(1).max(120).optional()
});

export const createPageSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  slug: slugSchema.optional(),
  status: contentStatusSchema.default("borrador")
});

export const changeStatusSchema = z.object({
  id: uuidSchema,
  status: contentStatusSchema
});

export type ContentStatusInput = z.infer<typeof contentStatusSchema>;
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;

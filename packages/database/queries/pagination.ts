/**
 * Paginación por rango, compartida por todas las queries del DAL.
 *
 * Se usa `range()` de PostgREST (equivalente a LIMIT/OFFSET) con `count: "exact"`
 * para poder informar el total sin una segunda consulta.
 */

export interface PageRequest {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface ResolvedRange {
  readonly page: number;
  readonly pageSize: number;
  readonly from: number;
  readonly to: number;
}

/** Normaliza la petición a un rango seguro: nunca negativo, nunca ilimitado. */
export function resolveRange(request: PageRequest = {}): ResolvedRange {
  const page = Math.max(1, Math.trunc(request.page ?? 1) || 1);
  const requested = Math.trunc(request.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
  const from = (page - 1) * pageSize;

  return { page, pageSize, from, to: from + pageSize - 1 };
}

export function paginate<T>(
  items: readonly T[],
  range: ResolvedRange,
  total: number | null
): Paginated<T> {
  const resolvedTotal = total ?? items.length;

  return {
    items,
    page: range.page,
    pageSize: range.pageSize,
    total: resolvedTotal,
    totalPages: resolvedTotal === 0 ? 0 : Math.ceil(resolvedTotal / range.pageSize)
  };
}

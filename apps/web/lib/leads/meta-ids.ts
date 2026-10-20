/**
 * Identificadores de navegador de Meta para una futura Conversions API.
 *
 * - `_fbp` lo crea el píxel en el primer PageView; se usa tal cual.
 * - `_fbc` lo crea el píxel cuando la URL trae `fbclid`. Si no existe (píxel
 *   bloqueado, sin JavaScript o sin consentimiento) se deriva del `fbclid`
 *   capturado con el formato documentado por Meta:
 *   `fb.{índice de subdominio}.{creación en ms}.{fbclid}`. El índice es 1
 *   porque el dominio registrable es `studionomade.cl`.
 *
 * Los valores se validan otra vez en el schema Zod; aquí solo se resuelven.
 */
export interface MetaBrowserIdsInput {
  cookieFbp?: string;
  cookieFbc?: string;
  fbclid?: string;
  now: number;
}

export function buildFbc(fbclid: string, createdAt: number): string {
  return `fb.1.${createdAt}.${fbclid}`;
}

export function resolveMetaBrowserIds({ cookieFbp, cookieFbc, fbclid, now }: MetaBrowserIdsInput) {
  const fbp = cookieFbp?.trim() || undefined;
  const existingFbc = cookieFbc?.trim() || undefined;
  const clickId = fbclid?.trim() || undefined;
  return {
    fbp,
    fbc: existingFbc ?? (clickId ? buildFbc(clickId, now) : undefined)
  };
}

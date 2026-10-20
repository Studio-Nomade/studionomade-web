# Threat model consolidado

## Activos y fronteras

Activos: sesiones Admin, contenido, medios, leads/PII, consentimientos, secretos de integraciones y continuidad del dominio. Fronteras: navegador→Next, Next→Supabase, Supabase Storage, Web→Noma y publicación SFTP. Noma es un sistema externo intocable.

## Amenazas y mitigaciones

| Amenaza                     | Control                                                                                      | Estado                                              |
| --------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| XSS/contenido activo        | CSP por superficie (ver abajo), `object-src none`, whitelist Vimeo/Behance, parser de embeds | Implementado; validar en preview                    |
| CSRF/mutación no autorizada | Server Actions same-origin, sesión validada, allowlist, guards y RLS                         | Implementado                                        |
| Acceso horizontal           | RLS por permisos/roles, URLs privadas firmadas                                               | Implementado en migraciones; revalidar con DB local |
| Upload malicioso/predecible | MIME/tamaño por bucket y rutas UUID server-side                                              | Implementado                                        |
| Abuso de formularios        | honeypot, token firmado, rate limit por hash de IP                                           | Implementado                                        |
| Exposición de PII           | redacción de logs/telemetría, payload Noma mínimo                                            | Implementado/testeado                               |
| Supply chain/secretos       | `pnpm audit --audit-level high`, Gitleaks binario en CI                                      | Implementado; ejecutar antes de entrega             |
| DNS/correo                  | export real, cambios humanos por lotes, rollback de zona                                     | Bloqueado por PB-04                                 |

Riesgo residual: `style-src 'unsafe-inline'` es necesario para los atributos `style` que
usa el sistema de revelado. El proveedor externo de errores/analítica sigue sin aprobar,
por lo que no hay evidencia de tracker ni alertas reales.

**El CSP no es uno solo: hay dos, y la diferencia es deliberada.**

| Superficie   | `script-src`                        | Por qué                                                                                                                                                                                                                         |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin` | `'self' 'nonce-…' 'strict-dynamic'` | Todas sus rutas son `force-dynamic`, así que Next puede estampar el nonce en el HTML. Es donde están la sesión, los leads y la PII.                                                                                             |
| `apps/web`   | `'self' 'unsafe-inline'`            | El sitio público es **prerenderizado a propósito** (D6/D7). En una página generada en build no existe ninguna petición de la que sacar un nonce, y Next emite scripts en línea con los datos de Flight que no se pueden firmar. |

El intento inicial de aplicar la política con nonce también al sitio público **dejó el
sitio sin JavaScript**: `'strict-dynamic'` anula el permiso por origen, el HTML
prerenderizado sale sin nonce y el navegador bloquea los 14 scripts de la home. Está
cubierto por `packages/config/src/security.test.ts`.

**Riesgo asumido:** en el sitio público, una XSS que consiga inyectar un `<script>` en
línea se ejecutaría. Se mitiga porque el sitio no renderiza HTML de usuario y porque
`object-src`, `base-uri`, `form-action` y `frame-ancestors` siguen cerrados. Para cerrarlo
del todo habría que pasar el público a renderizado dinámico y perder el prerender: es una
decisión de producto pendiente, no un olvido.

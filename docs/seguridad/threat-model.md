# Threat model consolidado

## Activos y fronteras

Activos: sesiones Admin, contenido, medios, leads/PII, consentimientos, secretos de integraciones y continuidad del dominio. Fronteras: navegador→Next, Next→Supabase, Supabase Storage, Web→Noma y publicación SFTP. Noma es un sistema externo intocable.

## Amenazas y mitigaciones

| Amenaza                     | Control                                                                     | Estado                                              |
| --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------- |
| XSS/contenido activo        | CSP con nonce, `object-src none`, whitelist Vimeo/Behance, parser de embeds | Implementado; validar en preview                    |
| CSRF/mutación no autorizada | Server Actions same-origin, sesión validada, allowlist, guards y RLS        | Implementado                                        |
| Acceso horizontal           | RLS por permisos/roles, URLs privadas firmadas                              | Implementado en migraciones; revalidar con DB local |
| Upload malicioso/predecible | MIME/tamaño por bucket y rutas UUID server-side                             | Implementado                                        |
| Abuso de formularios        | honeypot, token firmado, rate limit por hash de IP                          | Implementado                                        |
| Exposición de PII           | redacción de logs/telemetría, payload Noma mínimo                           | Implementado/testeado                               |
| Supply chain/secretos       | `pnpm audit --audit-level high`, Gitleaks binario en CI                     | Implementado; ejecutar antes de entrega             |
| DNS/correo                  | export real, cambios humanos por lotes, rollback de zona                    | Bloqueado por PB-04                                 |

Riesgo residual: `style-src 'unsafe-inline'` es necesario para estilos de Next/React actuales; scripts sí exigen nonce y `strict-dynamic`. El proveedor externo de errores/analítica sigue sin aprobar, por lo que no hay evidencia de tracker ni alertas reales.

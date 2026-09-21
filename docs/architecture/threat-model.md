# Threat model inicial

## Alcance y activos

Modelo preliminar para el código público, cadena de suministro, despliegues futuros, contenido, identidades de editores y datos futuros en Supabase. M00 no implementa autenticación ni persistencia.

## Límites de confianza

1. Navegador ↔ aplicaciones Vercel.
2. Aplicaciones ↔ Supabase Web.
3. CI/CD GitHub ↔ Vercel y otros proveedores.
4. Ecosistema Web ↔ Noma mediante una integración futura.
5. Administradores ↔ consolas GitHub, Vercel, Supabase, SiteGround y Google.

## Amenazas y controles

| Categoría            | Escenario                                              | Control inicial / futuro                                                        |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Suplantación         | Cuenta administrativa comprometida                     | OAuth, MFA, cuentas nominativas y mínimo privilegio; pendiente de hitos futuros |
| Manipulación         | Cambio no autorizado de código, contratos o DNS        | Protecciones de rama, revisión, lockfile, baseline DNS y auditoría              |
| Repudio              | Acción administrativa sin trazabilidad                 | Logs de proveedores y PR revisado; retención por definir                        |
| Divulgación          | Secretos o know-how publicados                         | Separación de repos, `.env*` ignorado, Gitleaks y revisión humana               |
| Denegación           | Abuso de endpoints o agotamiento de cuotas             | CDN, límites y monitoreo a diseñar antes de exponer APIs                        |
| Elevación            | Cliente obtiene privilegios de edición o base de datos | Autorización del lado servidor y RLS en hitos posteriores; nunca confiar en UI  |
| Cadena de suministro | Dependencia o Action comprometida                      | Lockfile, permisos CI mínimos y revisión de actualizaciones                     |
| Frontera Noma        | Datos o comandos no validados cruzan sistemas          | Contratos versionados, validación y mínima exposición futura                    |

## Decisiones pendientes

Los propietarios, retención de logs, RTO/RPO, clasificación de datos, políticas RLS y controles de integración se definirán en hitos autorizados. Los accesos sin confirmar están en [preguntas bloqueantes](../discovery/preguntas-bloqueantes.md).

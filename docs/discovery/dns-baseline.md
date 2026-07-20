# Baseline DNS

## Estado

La exportación real de la zona SiteGround no fue entregada. Está registrada como [PB-04](preguntas-bloqueantes.md). Este documento es una plantilla y **no autoriza cambios DNS**.

## Cómo capturar el baseline

1. Ingresar a SiteGround con una cuenta autorizada y MFA.
2. Exportar la zona completa de `studionomade.cl` o copiar todos los registros visibles.
3. Guardar la fecha/hora, zona horaria, operador y método de exportación.
4. Revisar que la captura incluya nombre, tipo, TTL, prioridad y valor, sin credenciales.
5. Sustituir la tabla vacía siguiente mediante una revisión auditada antes de modificar DNS.

| Capturado en | Operador  | Fuente     | Archivo/evidencia |
| ------------ | --------- | ---------- | ----------------- |
| Pendiente    | Pendiente | SiteGround | Pendiente (PB-04) |

| Nombre    | Tipo      |       TTL | Prioridad | Valor real actual | Observación              |
| --------- | --------- | --------: | --------: | ----------------- | ------------------------ |
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente         | Espera exportación PB-04 |

## Mapa conceptual de destinos

No contiene valores técnicos. Los targets definitivos dependen de [PB-06](preguntas-bloqueantes.md).

| Nombre conceptual       | Plataforma prevista | Uso                                                         |
| ----------------------- | ------------------- | ----------------------------------------------------------- |
| `@`                     | Vercel              | Sitio público                                               |
| `www`                   | Vercel              | Alias del sitio público                                     |
| `admin`                 | Vercel              | Web Admin                                                   |
| `noma`                  | Vercel              | Servicio existente; no modificar en M00                     |
| `prototipos`            | SiteGround          | Prototipos                                                  |
| MX / SPF / DKIM / DMARC | Google Workspace    | Correo y autenticación de dominio; conservar valores reales |

## Validación y rollback de un cambio futuro

Antes de cambiar, comparar la zona con este baseline, reducir TTL solo mediante un plan aprobado y verificar correo además de HTTP. El rollback futuro consiste en restaurar exactamente los registros exportados; M00 no efectúa cambios y, por tanto, no requiere rollback DNS.

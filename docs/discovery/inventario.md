# Inventario técnico inicial

Fecha del levantamiento: 2026-07-20. La información proviene exclusivamente del handoff de M00; no se validaron consolas externas.

| Área             | Recurso conocido                                 | Estado / acceso                              | Pendiente                                                            |
| ---------------- | ------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| GitHub           | Organización `Studio-Nomade`                     | Conocida; administradores no informados      | [PB-03](preguntas-bloqueantes.md#preguntas-bloqueantes-y-pendientes) |
| GitHub           | Repositorio público `studionomade-web`           | Existe; rama base `testing`                  | PB-03, PB-07                                                         |
| GitHub           | Repositorio privado `studionomade-core`          | Existe; no es dependencia del público        | PB-03                                                                |
| Vercel           | Proyectos Web y Admin                            | Por crear/configurar fuera de M00            | PB-01, PB-06                                                         |
| Supabase         | Proyecto Web                                     | Estado, región e identificador no informados | PB-02                                                                |
| Supabase         | Proyecto Noma                                    | Existe según handoff; no tocar               | PB-02                                                                |
| SiteGround       | DNS de `studionomade.cl` y hosting de prototipos | Acceso y zona real no informados             | PB-04, PB-05, PB-06                                                  |
| Google Workspace | Correo y Google OAuth futuro                     | Tenant y administradores no informados       | PB-05                                                                |

## Dominios conocidos

| Nombre                       | Propósito                            | Estado verificable en M00              |
| ---------------------------- | ------------------------------------ | -------------------------------------- |
| `studionomade.cl`            | Sitio público y Digital Lab (`/lab`) | Destino real pendiente                 |
| `www.studionomade.cl`        | Alias del sitio público              | Destino real pendiente                 |
| `admin.studionomade.cl`      | CMS propio                           | Destino real pendiente                 |
| `prototipos.studionomade.cl` | Prototipos en SiteGround             | Destino real pendiente                 |
| `noma.studionomade.cl`       | Operación comercial existente        | No tocar; inventario técnico pendiente |

El inventario registra referencias, no secretos. Cualquier valor ausente se mantiene en [preguntas bloqueantes](preguntas-bloqueantes.md).

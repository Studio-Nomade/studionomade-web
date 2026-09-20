# Capas y límites (M05)

La columna vertebral de la aplicación. Define quién puede llamar a quién y dónde vive cada tipo de decisión.

## Las capas

```
UI (Server Components, formularios)
        │  solo props y resultados; nunca SQL, nunca reglas de negocio
        ▼
BFF (Route Handlers / Server Actions)      apps/*/app/**, apps/*/lib/bff/**
        │  valida (zod) → autoriza → delega → mapea errores
        ▼
Dominio (server-only)                      packages/domain
        │  reglas de negocio: slugs, estados, indexación, permisos
        ▼
DAL (repositorios)                         packages/database
        │  la única capa que habla PostgREST/SQL
        ▼
Postgres + RLS                             supabase/migrations
```

**Regla de dependencias:** cada capa solo conoce la inmediatamente inferior. `packages/*` **nunca** importa desde `apps/*`.

## Qué decide cada capa

| Decisión | Dónde | Por qué ahí |
|---|---|---|
| Forma de la entrada | BFF, con zod | Es el borde: todo lo de fuera es hostil hasta que se valida |
| ¿Quién eres? | `packages/auth` (`getUser()`) | Validar el JWT contra el servidor, no confiar en la cookie |
| ¿Puedes hacerlo? | Dominio (`assertPermission`) + **RLS** | El dominio da un error claro; RLS es la garantía real |
| Reglas de negocio | `packages/domain` | Testeable sin base de datos ni HTTP |
| Cómo se consulta | `packages/database` | Un solo lugar que sabe de tablas y columnas |
| Última palabra | RLS | Aunque todo lo anterior falle, la base deniega |

## El patrón BFF

Cuatro pasos, siempre en este orden. Hay una implementación de referencia de cada tipo:

- **Route Handler** → [`apps/admin/app/api/paginas/route.ts`](../../apps/admin/app/api/paginas/route.ts)
- **Server Action** → [`apps/admin/lib/bff/pages.actions.ts`](../../apps/admin/lib/bff/pages.actions.ts)

```
1. Validar     listPagesQuerySchema.safeParse(...)   → 422 si falla
2. Autorizar   createBffContext(route)               → 401/403 si falla
3. Delegar     context.pages.list(input)             → sin lógica aquí
4. Mapear      toHttpError(error, logger, requestId) → nunca filtra internals
```

`createBffContext()` ([`lib/bff/context.ts`](../../apps/admin/lib/bff/context.ts)) construye identidad verificada, acceso efectivo, logger correlacionado y servicios ya cableados. Todo lo que pase por ahí cumple el patrón por construcción.

**Diferencia de la Server Action:** no lanza el error, devuelve un `ActionResult` discriminado. Así el formulario puede pintar el mensaje y **seguir funcionando sin JavaScript**.

## Taxonomía de errores

Dos familias, misma forma: `code`, `status`, `message` público y `detail` interno que **solo** va al log.

| Familia | Dónde | Códigos |
|---|---|---|
| `AuthError` | `packages/auth` | `no_session` (401), `not_allowlisted` (403), `no_profile` (403), `forbidden` (403) |
| `DataError` | `packages/database` | `not_found` (404), `conflict` (409), `forbidden` (403), `validation` (422), `infrastructure` (500) |

`mapPostgrestError()` traduce los códigos de Postgres: `23505`/`23503` → `conflict`, `42501` → `forbidden` (RLS denegó una escritura), `23514`/`23502`/`22P02` → `validation`, `PGRST116` → `not_found`.

> **Nota sobre lectura y RLS:** una lectura denegada por RLS no da error, devuelve cero filas. Por eso `not_found` y `forbidden` son indistinguibles al leer — y eso es deseable: no revela la existencia de recursos ajenos.

## Logging

JSON de una línea, con `requestId` de correlación en todas las entradas y `userId` opaco cuando hay sesión.

**Nunca PII.** El logger tiene una lista de claves prohibidas (`email`, `phone`, `ip`, `name`, `password`, `token`…): si alguien las pasa por descuido, el valor se sustituye por una marca `<clave>_omitido: true`. Está cubierto por test.

Los 4xx esperados se registran como `warn` (`request.rejected`), no como `error`: un 403 es funcionamiento normal, no una incidencia.

## Paginación

`resolveRange()` normaliza la petición a un rango seguro: nunca negativo, nunca ilimitado (`MAX_PAGE_SIZE = 100`). `paginate()` devuelve `items`, `page`, `pageSize`, `total` y `totalPages` usando el `count: "exact"` de PostgREST, sin segunda consulta.

## Estado de los repositorios

Implementados con el patrón completo: **`pages`** (list con filtro y búsqueda, findBySlug, getById, create, update, remove, slugExists) y **`areas`** (catálogo pequeño, sin paginación).

El resto de entidades del modelo se añaden en sus hitos (M06 contenido, M07 proyectos y multimedia) **siguiendo este mismo patrón**: un archivo por entidad en `repositories/`, mapper en `mappers/`, y errores siempre vía `mapPostgrestError`.

## Servicios externos

`packages/domain/src/services/contracts.ts` define solo **interfaces**: `LeadService`, `MailService`, `NotificationService`. Las implementaciones llegan en sus hitos (captura de leads y correo; Noma en M10). El dominio se escribe contra la interfaz para que esos hitos no tengan que reabrir esta capa.

## Cómo añadir una entidad nueva

1. `mappers/` — fila → entidad, en `camelCase`, sin columnas internas.
2. `repositories/<entidad>.ts` — queries y mutations, errores con `mapPostgrestError`.
3. Exportar desde `packages/database/index.ts`.
4. `packages/validation` — esquemas zod de entrada.
5. `packages/domain/services/` — reglas de negocio y comprobación de permisos.
6. BFF — Route Handler o Server Action siguiendo el patrón de 4 pasos.
7. **RLS** — políticas en una migración con `down`. Sin esto, lo anterior no protege nada.

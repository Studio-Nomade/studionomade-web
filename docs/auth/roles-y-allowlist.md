# Autenticación y autorización (M04)

Cómo entra alguien al panel de Studio Nomade y qué puede hacer una vez dentro.

## Autorización en profundidad

Tres capas independientes. Ninguna confía en la anterior.

| Capa           | Dónde                                                                         | Qué decide                                                                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Middleware** | `apps/admin/middleware.ts`                                                    | Si hay **sesión válida**. Refresca la cookie y redirige a `/login`. No consulta roles: obligaría a un viaje a la base de datos en cada request y **no es la frontera de seguridad real**. |
| **Servidor**   | `packages/auth` (`requireAdminAccess`, `requirePermission`, `requireAnyRole`) | Vuelve a validar el JWT, aplica la **allowlist** y exige rol/permiso antes de ejecutar nada.                                                                                              |
| **RLS**        | Políticas de Postgres (migración `202609201200`)                              | La última palabra. Aunque el servidor se equivocara, la base de datos deniega.                                                                                                            |

En las tres se usa `auth.getUser()`, **nunca `auth.getSession()`**: `getSession()` se limita a leer la cookie y confiar en ella, lo que permitiría falsificar la identidad.

## Allowlist — deny by default

Variable `AUTH_ALLOWLIST` (fuera de Git, solo entorno). Formato separado por comas, espacios o saltos de línea:

- `persona@studionomade.cl` — un correo concreto
- `@studionomade.cl` — cualquier correo de ese dominio

**Una allowlist vacía o ausente no deja entrar a nadie.** "Sin configurar" nunca se interpreta como "todo permitido": es preferible un panel inaccesible a uno abierto por un despliegue mal configurado.

Dónde se aplica: en `app/auth/callback/route.ts`. Supabase Auth crea la cuenta en cuanto Google devuelve un código válido, así que el callback es la puerta — si el correo no está permitido, se cierra la sesión al instante y se registra el rechazo (sin PII: solo el id de usuario).

**Segunda barrera:** un usuario recién creado obtiene perfil pero **cero roles**, y sin rol activo no puede leer ni escribir nada. Aunque alguien se saltara el callback, seguiría sin acceso.

## Los 8 roles

Matriz de menor privilegio (`threat-model.md` §3), sembrada en `public.role_permissions`.

| Rol            | content.read | content.write | content.publish | settings.manage | users.manage |
| -------------- | :----------: | :-----------: | :-------------: | :-------------: | :----------: |
| `superadmin`   |      ✅      |      ✅       |       ✅        |       ✅        |      ✅      |
| `admin`        |      ✅      |      ✅       |       ✅        |       ✅        |      —       |
| `editor`       |      ✅      |      ✅       |       ✅        |        —        |      —       |
| `reviewer`     |      ✅      |       —       |       ✅        |        —        |      —       |
| `area_editor`  |      ✅      |     ✅ \*     |        —        |        —        |      —       |
| `commercial`   |      —       |       —       |        —        |        —        |      —       |
| `analyst`      |      ✅      |       —       |        —        |        —        |      —       |
| `collaborator` |      ✅      |       —       |        —        |        —        |      —       |

\* `area_editor` solo puede editar las áreas que tenga asignadas en `user_area_permissions`, y publicar solo si además tiene `can_publish`. Lo hace cumplir `public.can_edit_area()` / `can_publish_area()` dentro de las políticas RLS, no la UI.

`admin` **no** tiene `users.manage`: la gestión de usuarios y seguridad es exclusiva de `superadmin`.

`commercial` no tiene permisos de contenido porque su alcance son los **leads**, gobernados por políticas propias sobre `public.leads`, `form_submissions` y `lead_events`.

### Reconciliación del catálogo (M03 → M04)

M03 sembró 4 roles provisionales (`admin`, `editor`, `author`, `viewer`) que no coincidían con la matriz. M04 añade los 6 que faltaban y **desactiva** `author` y `viewer` (`is_active = false`) en lugar de borrarlos: es reversible y no rompe referencias en `user_roles`. Los roles inactivos se ignoran al calcular el acceso efectivo.

## Helpers de base de datos

Todos `SECURITY DEFINER` con `search_path` fijo — obligatorio para no ser vulnerables a _search_path hijacking_ — y sin permiso de ejecución para `anon`.

| Función                  | Devuelve                                                |
| ------------------------ | ------------------------------------------------------- |
| `current_role_slugs()`   | Slugs de los roles **activos** del usuario              |
| `has_role(slug)`         | Si tiene ese rol                                        |
| `has_permission(code)`   | Si algún rol suyo otorga ese permiso                    |
| `can_edit_area(area)`    | `content.write`, acotado por área si es `area_editor`   |
| `can_publish_area(area)` | `content.publish`, acotado por área si es `area_editor` |

## Aprovisionamiento de perfiles

El trigger `on_auth_user_created` sobre `auth.users` crea la fila en `public.profiles`. `display_name` es `NOT NULL` con check de 1–120 caracteres, así que se deriva en cascada de `full_name` → `name` → parte local del correo → `"Usuario"`, truncando a 120.

**No asigna ningún rol.** La asignación es siempre explícita.

## Auditoría

El trigger `log_audit_event()` registra `insert`/`update`/`delete` en `audit_logs` para `user_roles`, `user_area_permissions` y `site_settings`, con `actor_id = auth.uid()` y los estados antes/después.

El identificador de entidad se deriva del `jsonb` de la fila, no de `new.id`: `user_roles` y `user_area_permissions` tienen **clave primaria compuesta y ninguna columna `id`**.

`audit_logs` es de **solo lectura** incluso para quien puede consultarla (`users.manage`): el `INSERT` está revocado para `authenticated` y solo escriben los triggers.

## Variables de entorno

| Variable                               | Dónde    | Notas                                                           |
| -------------------------------------- | -------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | admin    | pública                                                         |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | admin    | pública por diseño; sujeta a RLS. **Nunca la service role key** |
| `AUTH_ALLOWLIST`                       | admin    | deny by default                                                 |
| `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET`   | Supabase | los consume Supabase Auth, no Next.js                           |

El **redirect URI** que hay que registrar en Google Cloud Console apunta a **Supabase**, no a Next.js, porque Supabase actúa de broker OAuth:

- local: `http://127.0.0.1:54321/auth/v1/callback`
- producción: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

## Pendientes conocidos

- **MFA para `superadmin`/`admin`**: el hito lo pedía "si es viable". Queda pendiente — Supabase Auth soporta TOTP, pero exige UI de enrolamiento y recuperación que no entra en el alcance de M04.
- **Revocación de sesión y último acceso**: `signOut()` cierra la sesión del propio usuario; la revocación por parte de un administrador necesita la Admin API con service role y va junto con la pantalla de gestión de usuarios (M06/M07).
- **Verificación end-to-end del login con Google**: requiere las credenciales reales de Studio Nomade. Todo lo demás está probado.

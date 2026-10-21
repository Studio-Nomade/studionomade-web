# Intranet (admin): estado a octubre 2026

`apps/admin` es la intranet de Studio Nomade: un Next.js 15 aparte del sitio,
conectado al mismo Supabase (StudioNomade-Web). Hoy **no está desplegado**: no hay
proyecto de Vercel para el admin.

## Autenticación y permisos

1. **Login:** Google Workspace vía Supabase Auth (`/login` → `/auth/callback`).
2. **Middleware:** solo verifica que haya sesión y refresca la cookie. Aplica un CSP
   estricto con nonce, porque el admin es todo dinámico.
3. **Servidor (`packages/auth`):** cada página vuelve a validar el JWT y aplica la
   allowlist `AUTH_ALLOWLIST`. Si falta, nadie entra. También exige al menos un
   rol activo.
4. **Guards por página:**
   - `requirePermission`: `content.read`, `content.write` o `content.publish`.
   - `requireAnyRole`: `commercial`, `admin` o `superadmin` para leads.
5. **RLS en Postgres:** es la última palabra. Las mismas reglas valen aunque
   alguien llame a la API directo.

Roles y permisos (`202609201200_auth_roles_authorization.sql`):

| Rol                    | Permisos                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
| superadmin             | content.read, content.write, content.publish, settings.manage, users.manage |
| admin                  | content.read, content.write, content.publish, settings.manage               |
| editor                 | content.read, content.write, content.publish                                |
| reviewer               | content.read, content.publish                                               |
| area_editor            | content.read, content.write (solo sus áreas)                                |
| analyst / collaborator | content.read                                                                |
| commercial             | gestión de leads (por rol, no por permiso)                                  |

## Pantallas

| Ruta                        | Estado          | Qué hace                                                                                                                   |
| --------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | ✅              | Inicio: leads por estado y últimas notas del blog.                                                                         |
| `/leads`                    | ✅ nuevo        | Bandeja de leads con contadores por estado, búsqueda y filtros (origen, área, presupuesto, prioridad). Pagina de 50 en 50. |
| `/leads/[id]`               | ✅ nuevo        | Ficha del lead y su clasificación. Ver detalle abajo.                                                                      |
| `/blog`                     | ✅ nuevo        | Listado de notas con su estado.                                                                                            |
| `/blog/nueva`, `/blog/[id]` | ✅ nuevo        | Editor de notas. Ver detalle abajo.                                                                                        |
| `/proyectos`                | ⚠️ solo lectura | Lista la tabla `projects`. Ver nota abajo.                                                                                 |
| `/lab`                      | ⚠️ solo lectura | Inventario de prototipos.                                                                                                  |
| `/senales`                  | ⚠️ mínimo       | Contadores de leads y proyectos, sin datos personales.                                                                     |

**Ficha del lead (`/leads/[id]`):**

- Muestra todos los datos: contacto, calificación del formulario /contacto, atribución (UTM, gclid/fbclid, página de entrada), consentimiento, mensaje e historial (`lead_events`).
- La clasificación cubre estado, prioridad, área que lo toma, notas internas y motivo de descarte.
- El botón **Derivar a NOMA** aparece solo en leads calificados.

**Editor de notas (`/blog/nueva`, `/blog/[id]`):**

- El cuerpo se escribe en markdown mínimo y se guarda como bloques sin HTML.
- Acciones: guardar borrador, publicar, despublicar, archivar y eliminar.
- La URL se genera desde el título.

**Proyectos (`/proyectos`):** el sitio público todavía lee los casos desde
`apps/web/content/projects.ts`, no desde la base. Para subir proyectos desde el
admin falta:

1. El editor de casos (bloques ya definidos en `components/projects/blocks`).
2. La subida de imágenes a Storage.
3. Que `/proyectos` lea de Supabase con respaldo local, igual que el blog.

## Flujo de leads

1. El formulario del sitio llama a la RPC `capture_lead` con service role. El lead
   entra como **nuevo** y deja el evento "Lead recibido". También se avisa por correo
   o Slack si están configurados.
2. En el admin, el equipo comercial lo revisa y clasifica:
   - Estados intermedios: revisado, contactado, calificado.
   - Si no corresponde: descartado (con motivo) o spam.
   - Asigna prioridad y el área que lo toma, y deja notas internas.
   - Cada cambio queda en el historial con quién lo hizo.
3. Con el lead **calificado**, "Derivar a NOMA" lo envía firmado con HMAC-SHA256
   (`packages/domain/noma.ts`, contrato en `packages/contracts`). Si NOMA confirma,
   el estado pasa a **derivado**. Si la integración no está configurada, el lead
   sigue calificado y queda el evento "Derivación pendiente".

Migraciones aplicadas en producción (StudioNomade-Web, 2026-10-21):
`202610200001_lead_click_ids`, `202610210001_lead_qualification`,
`202610210002_blog_posts` y `202610210003_lead_triage`.

## Variables de entorno (solo nombres)

**Admin:**

| Variable                               | Uso                                            |
| -------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL del proyecto Supabase.                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publishable de Supabase.                 |
| `AUTH_ALLOWLIST`                       | Correos o dominios que pueden entrar.          |
| `NOMA_INTEGRATION_ENABLED`             | Activa la derivación a NOMA (`true`).          |
| `NOMA_LEADS_ENDPOINT`                  | Endpoint de NOMA que recibe los leads (https). |
| `NOMA_WEBHOOK_SECRET`                  | Secreto HMAC compartido con NOMA.              |

**Sitio (`apps/web`):**

- Para recibir leads: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEAD_IP_SALT` y `LEAD_FORM_SECRET`.
- Avisos (opcionales): `SLACK_LEADS_WEBHOOK_URL`, `GOOGLE_SMTP_USER`, `GOOGLE_SMTP_APP_PASSWORD` y `LEADS_NOTIFY_TO`.
- Para leer el blog desde Supabase: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Para Instagram: `INSTAGRAM_ACCESS_TOKEN`.
- **El proyecto de Vercel del sitio hoy no tiene ninguna de estas variables.** Por eso
  el formulario no guarda leads en el preview, y el blog y la cuadrícula de Instagram
  usan su respaldo local.

## Para publicar el admin

1. **Vercel:** proyecto nuevo `studionomade-admin` en el team studio-nomade, mismo
   repo, Root Directory `apps/admin`. El repo es público, así que el plan Hobby sirve.
2. **Variables:** las del admin listadas arriba, en Production y Preview.
3. **Supabase Auth:**
   - Agregar `https://admin.studionomade.cl/auth/callback` y la URL de preview a
     Redirect URLs.
   - Proveedor Google activo, con el cliente OAuth de Google Workspace.
4. **Dominio:** `admin.studionomade.cl`, con un CNAME en SiteGround hacia el target
   que entregue Vercel, igual que `assets`.
5. **Roles:**
   - El primer superadmin se asigna desde el SQL Editor en `public.user_roles`.
   - Al resto se le asigna `commercial`, `editor`, etc.

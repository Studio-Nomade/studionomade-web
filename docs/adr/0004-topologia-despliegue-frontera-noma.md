# ADR-0004: Topología de despliegue y frontera con Noma

- Estado: Aceptada
- Fecha: 2026-09-20
- Relacionada: [ADR-0002](0002-plataforma-aplicaciones.md) (Next.js + Vercel), [ADR-0003](0003-datos-identidad.md) (Supabase Web + Google OAuth)

## Contexto

El dominio oficial `studionomade.cl` alojaba el sitio en Bluehosting, con un plan de
migrar a SiteGround (dominio temporal `studion17.sg-host.com`). En paralelo, ambas
aplicaciones del monorepo `studionomade-web` dejaron de ser estáticas:

- `apps/web` (público) captura leads con Server Actions, la ruta dinámica
  `/api/contacto/token` (firma anti-spam por petición) y escritura a Supabase con
  `service_role`.
- `apps/admin` (CMS) es dinámico de punta a punta: login con Supabase Auth (cookies
  SSR), Google OAuth, allowlist y roles (M04), y escritura de contenido.

SiteGround (hosting tradicional cPanel/PHP) **no ejecuta Next.js con SSR/Server
Actions**; a lo sumo serviría un export estático, lo que rompería la captación de
leads y el CMS. Además, `Noma` es la plataforma operativa dedicada de Studio Nomade,
en su propio dominio `noma.studionomade.cl`, con su propia Supabase (ver ADR-0003).

Surge la pregunta de dónde vive cada pieza y cómo se separa "lo del sitio oficial"
de "lo de Noma".

## Decisión

**1. Todo el código corre en Vercel + Supabase; SiteGround no es host de las apps.**
Confirma y extiende ADR-0002. `apps/web` y `apps/admin` se despliegan como dos
proyectos Vercel independientes. SiteGround, de conservarse, solo cumple rol de DNS o
correo; no aloja las aplicaciones.

**2. La separación oficial vs Noma es de datos y dominio, no de servidor.**
El eje de separación es la base de datos, no la caja:

- **Supabase-A (oficial)**: auth de colaboradores, contenido/blog del CMS y los leads
  capturados. La comparten `apps/web` (lectura de contenido publicado) y `apps/admin`
  (escritura).
- **Supabase-B (Noma)**: dedicada al pipeline operativo, separada y fuera de alcance
  del sitio oficial (ADR-0003).

**3. Mapa de dominios.**

```
CLUSTER OFICIAL (Vercel, Supabase-A)
  studionomade.cl          -> apps/web    (público; lee contenido publicado)
  admin.studionomade.cl    -> apps/admin  (login de colaboradores, blog, gestión de leads)
                                          escribe contenido + leads en Supabase-A
                          │
                          │  handoff: lead calificado + reunión agendada
                          ▼
CLUSTER NOMA (Vercel, Supabase-B)
  noma.studionomade.cl     -> app Noma    (operativa; repo y Supabase propios)
```

**4. El admin es del cluster oficial, no de Noma.**
`apps/admin` vive en el mismo monorepo que `apps/web` (paquetes compartidos
`@studionomade/ui`, `auth`, `database`, `content-schema`) y escribe en Supabase-A. Se
publica como subdominio `admin.studionomade.cl`. Ahí los **colaboradores de Studio
Nomade inician sesión con sus credenciales** (Google OAuth + allowlist + roles de M04)
y **aportan al blog** y gestionan leads. No se integra dentro de Noma ni comparte su
Supabase.

**5. El traspaso de leads a Noma es un asiento server-side controlado.**
Cuando un lead se **califica y agenda reunión**, pasa de Supabase-A al pipeline de
Noma a través de las interfaces que M05 dejó preparadas (`LeadService` /
`NotificationService`): una llamada server-side firmada (o job de sincronización)
hacia Noma, nunca acceso directo cruzado a la base de datos del otro. Mantiene la
misma disciplina de frontera que la sanitización de contratos de M02.

## Consecuencias

- **SiteGround deja de ser host** de las apps; la migración de hosting apunta a Vercel.
  Si no se usa para correo/DNS, se jubila.
- **Cookies de Auth** quedan acotadas a `admin.studionomade.cl` (admin auto-contenido:
  login + CMS ahí). No se comparte sesión con el dominio público salvo necesidad real.
- **`noindex` y protección** en el admin (viene de M01 fuera de producción; en el
  subdominio conviene `noindex` siempre, y evaluar deploy protection de Vercel).
- **Variables de entorno por app en Vercel**:
  - `apps/web`: `LEAD_FORM_SECRET`, `LEAD_IP_SALT`, `SUPABASE_URL`,
    `SUPABASE_SERVICE_ROLE_KEY` (server-only), más las `NEXT_PUBLIC_*`.
  - `apps/admin`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
    `AUTH_ALLOWLIST`, `GOOGLE_OAUTH_CLIENT_ID/SECRET`. **Nunca** la service role key.
- **Aislamiento de fallos**: proyectos Vercel y Supabase separados evitan que un
  incidente en Noma tumbe el CMS oficial y viceversa, aunque compartan cuenta Vercel.
- El diseño concreto del handoff lead→Noma (contrato de la llamada, autenticación
  entre servicios, idempotencia) se especifica en un hito posterior.

## Alternativas consideradas

- **Público estático en SiteGround + solo el admin en Vercel.** Rechazada: la web
  pública ya no es estática (captación de leads server-side). Obligaría a fragmentar el
  formulario oficial hacia otro origen (CORS, endpoint separado) y a partir el código.
- **Admin dentro de Noma (mismo repo/Supabase).** Rechazada: acopla el CMS del sitio
  oficial al ciclo de vida y los datos de Noma, borra la frontera de ADR-0003 y mezcla
  dos universos de identidad (colaboradores del sitio vs usuarios operativos de Noma).

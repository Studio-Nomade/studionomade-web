# Convenciones de desarrollo

## Estructura y límites

- `apps/web`: composición y rutas del sitio público y Digital Lab.
- `apps/admin`: composición y rutas del CMS propio.
- `packages/ui`: componentes base neutrales, sin lógica de producto.
- `packages/types`: tipos técnicos compartidos, sin entidades comerciales.
- `packages/validation`: validadores compartidos para fronteras públicas.
- `packages/config`: configuración común de ESLint, TypeScript y Prettier.
- `packages/contracts`: contratos versionados; no contiene know-how privado.
- Los paquetes no importan desde `apps/*`. Las aplicaciones consumen paquetes mediante `@studionomade/*`.
- El repositorio público nunca depende de `studionomade-core` para instalar, probar o desplegar.

## Naming

- Carpetas y archivos: `kebab-case`, salvo convenciones de Next.js.
- Componentes y tipos: `PascalCase`.
- Funciones, variables y hooks: `camelCase`.
- Variables públicas: prefijo `NEXT_PUBLIC_`; variables privadas nunca se exponen al cliente.
- Tests unitarios: `*.test.ts` o `*.test.tsx`; e2e: `*.spec.ts`.

## Calidad

Antes de entregar una rama se ejecutan lint, typecheck, unit, e2e y build. Prettier define el formato compartido. Los tests unitarios viven junto al módulo y los smoke tests transversales en `tests/e2e`.

## Entornos

| Entorno    | Fuente de variables                                  | Indexación                 | Uso               |
| ---------- | ---------------------------------------------------- | -------------------------- | ----------------- |
| Local      | `.env.local` no versionado, basado en `.env.example` | `noindex`                  | Desarrollo        |
| Preview    | Variables Preview de cada proyecto Vercel            | `noindex` + `X-Robots-Tag` | Revisión de PR    |
| Production | Variables Production de cada proyecto Vercel         | Permitida                  | Sitios publicados |

Cada app mantiene su propio `.env.example`, únicamente con placeholders seguros. `VERCEL_ENV` es provista por Vercel; no se guarda como secreto ni se define manualmente en el repositorio. Si faltan variables públicas, el placeholder usa defaults locales seguros y el build continúa.

## Commits y revisiones

Usar mensajes breves que describan el cambio. Commit lint queda opcional en M01. Todo cambio a dependencias, límites de capas o contratos requiere revisión arquitectónica.

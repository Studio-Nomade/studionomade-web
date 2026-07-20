# Diagrama de capas

```mermaid
flowchart TB
  users["Usuarios y editores"] --> delivery["Entrega web — apps/web y apps/admin"]
  delivery --> presentation["Presentación — UI y design-system"]
  presentation --> application["Aplicación — content-schema, validation, analytics"]
  application --> boundaries["Límites — contracts, types, config"]
  boundaries --> adapters["Adaptadores futuros — auth y database"]
  adapters --> platform["Plataforma — Supabase, Vercel, SiteGround y Google"]
  external["Noma — sistema externo"] -. "contratos futuros" .-> boundaries
```

## Reglas de dependencia

- Las aplicaciones pueden consumir paquetes públicos del monorepo.
- Los límites compartidos no dependen de aplicaciones ni del repositorio privado.
- `auth` y `database` son placeholders; no contienen conexiones ni políticas en M00.
- La infraestructura entrega y persiste, pero no define reglas comerciales.

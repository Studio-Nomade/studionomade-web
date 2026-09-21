# Studio Nomade Web

Monorepo público del ecosistema web de Studio Nomade. Contiene las aplicaciones públicas y de administración, además de paquetes compartidos sin dependencia del repositorio privado.

## Requisitos

- Node.js 20 o superior
- pnpm 11.9.0

## Comandos

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

Las aplicaciones iniciales son placeholders de fundación; M00 no incorpora lógica de producto.

## Estructura

- `apps/web`: sitio público
- `apps/admin`: CMS propio
- `packages/*`: capacidades compartidas
- `supabase`: configuración local, migraciones y funciones futuras
- `docs`: arquitectura, descubrimiento y decisiones
- `tests`: pruebas transversales futuras

No se requieren secretos ni el repositorio privado para instalar o construir este proyecto.

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) y [las convenciones](docs/convenciones.md) antes de contribuir.

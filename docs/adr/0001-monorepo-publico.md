# ADR-0001: Monorepo público con pnpm y Turborepo

- Estado: Aceptada
- Fecha: 2026-07-20

## Contexto

Web y Admin comparten tecnología y capacidades, pero el repositorio público debe funcionar sin el core privado.

## Decisión

Usar un monorepo público con `apps/web`, `apps/admin`, `packages/*`, pnpm workspaces y Turborepo. Los contratos compartibles viven en el repositorio público sin reglas comerciales privadas.

## Consecuencias

Se centralizan comandos, lockfile y CI. Cada aplicación conserva un despliegue Vercel independiente. La frontera público/privado exige revisión permanente.

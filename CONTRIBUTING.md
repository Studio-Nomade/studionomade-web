# Contribuir a Studio Nomade Web

## Flujo

1. Crear una rama de hito desde `testing`.
2. Instalar con `pnpm install --frozen-lockfile`.
3. Mantener los cambios dentro del alcance aprobado.
4. Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e` y `pnpm build`.
5. Abrir un PR manual hacia `testing` después de la auditoría.

No se versionan secretos, archivos `.env` reales, know-how privado ni reglas comerciales. Consulta [las convenciones](docs/convenciones.md) antes de agregar módulos.

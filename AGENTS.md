# Studio Nomade web

## Scope

- Work in the public monorepo without depending on the private repository.
- Read the nearest `AGENTS.md` before editing a package.
- Import UI components only from `@studionomade/ui`.
- Import design tokens through `@studionomade/design-system/styles.css`.
- Keep Noma and its infrastructure out of scope.

## Required gates

- Run `pnpm lint` and `pnpm lint:css`.
- Run `pnpm check:tokens` and `pnpm check:assets`.
- Run `pnpm typecheck`, `pnpm test:unit`, and `pnpm build`.
- Run Playwright for affected routes.
- Run Gitleaks before handoff.

## Design-system map

- Tokens and fonts: `packages/design-system/AGENTS.md`.
- Components: `packages/ui/AGENTS.md`.
- Human specimens: `docs/design-system/guidelines/`.
- Definition of done: `docs/design-system/dod.md`.
- Baseline manifest: `docs/design-system/ds-manifest.json`.

## Hard rules

- Do not add raw colors, spacing pixels, or literal font families.
- Do not add inline styles except custom properties beginning with `--`.
- Do not add Tailwind, CSS-in-JS, `cva`, or `clsx`.
- Preserve Server Components unless interaction requires a client boundary.
- Never commit secrets or real environment values.

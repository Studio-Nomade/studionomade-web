# Checklist de hardening

- [x] CSP con nonce, `frame-ancestors none` y frames limitados a Vimeo/Behance.
- [x] HSTS, nosniff, referrer policy, permissions policy y anti-frame.
- [x] Uploads validados y nombres UUID; embeds validados.
- [x] Formulario con honeypot, token, rate limit y consentimiento versionado.
- [x] Admin con sesión, allowlist, guard server-side y RLS.
- [x] CI con auditoría de dependencias y Gitleaks CLI sin licencia de organización.
- [x] Batería RLS/Storage contra Supabase local: 8/8 pruebas negativas en verde.
- [ ] Validar CSP en preview con embeds reales autorizados.
- [ ] Definir retención/exportación/eliminación de leads con responsable legal.

Evidencia local 2026-09-21: Gitleaks sin hallazgos; `pnpm audit --audit-level high` sin vulnerabilidades high/critical (quedan 5 moderate y 2 low); lint/typecheck/build 13/13.

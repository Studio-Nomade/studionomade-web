# Mantenimiento

Semanal: revisar fallos de leads/correo/Noma, uptime y enlaces. Mensual: dependencias, audit, accesibilidad/SEO, Storage temporal y usuarios/roles. Trimestral: rotar secretos de integraciones, revisar allowlist/accesos, restore controlado y runbooks. Anual: revisar retención/privacidad, DNS/correo y continuidad.

Toda actualización entra por rama desde `testing`, CI, preview, auditoría y rollback. `temporary-uploads` se inspecciona primero en dry-run; la eliminación exige propietario, cutoff, respaldo y confirmación explícita. No ejecutar scripts destructivos en producción desde Codex.

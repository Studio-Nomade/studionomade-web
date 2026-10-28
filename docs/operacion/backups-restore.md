# Backups y restauración

Objetivo inicial sujeto a aprobación: RPO 24 h y RTO 4 h para Postgres/Storage; leads críticos pueden requerir RPO menor. Usar backups administrados de Supabase según plan, export adicional cifrado y versionado de objetos críticos; acceso mínimo y registro de restauraciones.

Ensayo trimestral en un proyecto Supabase aislado: seleccionar backup, restaurar, aplicar migraciones compatibles, comparar conteos/checksums, verificar RLS/Auth sin reutilizar OAuth productivo, validar una muestra de Storage y ejecutar tests. Destruir el entorno de ensayo mediante proceso autorizado. Registrar fecha, backup, responsables, tiempos, RPO/RTO real, fallos y remediación.

**Estado 2026-09-21:** no se recibió backup ni proyecto controlado. El restore no fue ensayado para evitar una acción destructiva; M15 permanece bloqueado en este criterio.

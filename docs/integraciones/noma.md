# Integración futura con Noma

## Estado y límites

M10 define el contrato saliente, pero **no toca Noma**, no conoce su base de datos y no ejecuta llamadas reales. El endpoint, secreto HMAC y acuerdo operativo siguen pendientes de Studio Nomade/Noma. Hasta entonces la integración permanece desactivada.

El contrato `2026-09-01` envía solo identificador, nombre, email, teléfono/empresa opcionales y origen. Excluye mensaje libre, IP, cookies, consentimientos y notas internas. Cada evento lleva UUID de idempotencia, fecha ISO, header de versión y firma `sha256=`. Solo admite HTTPS y reintenta 429/5xx hasta tres veces con backoff; 4xx permanentes fallan sin reintento.

Variables futuras, siempre fuera del repositorio: `NOMA_LEADS_ENDPOINT`, `NOMA_WEBHOOK_SECRET` y flag `NOMA_INTEGRATION_ENABLED`. La activación requiere: contrato aceptado por Noma, allowlist de red si corresponde, secreto rotado, prueba en sandbox, alertas y runbook de rollback. Rollback: desactivar el flag; los leads permanecen en Supabase Web para reproceso idempotente.

# Alertas operativas

Tras aprobar proveedor, configurar alertas sin payloads: tasa 5xx, fallos de captura de leads, correos fallidos, cola/reintentos Noma, disponibilidad Web/Admin y expiración SSL. Severidad crítica: leads indisponibles, dominio/SSL o correo; alta: Noma/correo de notificación; media: degradación CWV/SEO.

Cada alerta debe incluir `requestId`, entorno, servicio, timestamp, runbook y enlace al deploy; nunca PII. Las rutas de escalamiento y canales reales son **pendientes**. Probar un evento sintético antes de producción y documentar captura; actualmente no existe tracker aprobado, por lo que M13 no puede cerrarse.

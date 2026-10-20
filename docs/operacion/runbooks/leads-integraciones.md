# Leads, Noma o correo fallidos

Probar captura con dato ficticio, confirmar persistencia antes de reenviar y usar `requestId`/ID del lead. Si Supabase falla, deshabilitar temporalmente el formulario con mensaje honesto; no perder datos silenciosamente. Si Noma falla, mantener lead en Web, desactivar integración y reprocesar con la misma clave idempotente. Si correo falla, el lead persistido sigue siendo fuente de verdad. Nunca copiar payloads con PII al canal de incidente.

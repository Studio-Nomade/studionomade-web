# Métricas y decisión de proveedor

## Decisión pendiente

M13 exige aprobación previa del proveedor. Propuesta: **Vercel Analytics/Speed Insights** para CWV y uso agregado, y **Sentry** para errores frontend/servidor; alternativa de menor superficie: señales nativas de Vercel más logs estructurados sin tracker de producto. No se integró ningún SDK ni clave.

El paquete `@studionomade/analytics` define un adaptador degradable y elimina propiedades con apariencia de PII. Eventos permitidos: CTA, formulario (resultado, nunca contenido), video, enlace externo, apertura de prototipo y filtros. Dimensiones: ruta/slug, área, campaña, resultado y entorno. Prohibido: nombre, email, teléfono, mensaje, token, cookie, authorization e IP.

Presupuestos a validar en preview/producción: LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 en p75; cero violaciones críticas de axe; sitemap, robots, canonical, OG y JSON-LD válidos. Sin tráfico real no se declara cumplimiento CWV.

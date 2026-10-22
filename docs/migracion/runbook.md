# Runbook de cutover

> No ejecutar hasta resolver PB-04/PB-06 y aprobar ventana. Los cambios DNS los realiza Studio Nomade.

1. Asignar operador, revisor, ventana, canal y criterio go/no-go.
2. Exportar la zona SiteGround completa y verificar que incluye `@`, `www`, `admin`, `noma`, `prototipos`, MX, SPF, DKIM y DMARC. Cifrar/restringir el archivo.
3. Completar `dns-baseline.md` y `dns-objetivo.md` con valores reales; revisión a cuatro ojos. No modificar `noma` ni registros de correo salvo plan separado aprobado.
4. Confirmar proyectos/variables en Vercel, Supabase producción, dominios y SSL antes de apuntar DNS. Probar con hosts temporales.
5. Aplicar por lotes: web, validar; admin, validar; prototipos, validar. Preservar correo y Noma.
6. Verificar HTTP/HTTPS, redirects, formularios, Admin, leads, SSL, robots/sitemap y correo entrante/saliente.
7. Monitorear errores y disponibilidad durante la ventana y 24 h. Registrar timestamps/evidencia.
8. Ante criterio de rollback, detener lotes y seguir `rollback.md`.

Go exige baseline/objetivo completos, respaldo recuperable, responsables presentes, proveedor M13 operativo y pruebas en verde. Hoy es **NO-GO**: baseline real y proveedor de observabilidad pendientes.

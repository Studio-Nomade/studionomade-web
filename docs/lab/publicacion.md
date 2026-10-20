# Publicación de Digital Lab

Cada demo vive en `prototipos/<slug>/`, incluye `index.html`, `styles.css`, `version.json`, declara `noindex, nofollow`, usa datos ficticios y enlaza de vuelta al sitio principal.

Validar sin escribir fuera del repo: `pnpm prototype:prepare kinetic-type`. Preparar manifiesto local: `pnpm prototype:prepare kinetic-type --package`. El comando no abre conexiones ni acepta secretos; genera únicamente `artifacts/prototipos/<slug>/MANIFEST.txt` (ignorado por Git si se añade al flujo operativo).

La transferencia a SiteGround queda pendiente de `SFTP_HOST`, `SFTP_USER`, clave SSH y ruta real aprobada. Antes de publicar: respaldar la carpeta remota actual, subir a una ruta temporal, verificar HTML/assets, promover atómicamente y confirmar `X-Robots-Tag` o meta robots. Rollback: restaurar el respaldo de la versión anterior. Nunca incluir credenciales dentro del ZIP, manifiesto, historial o logs.

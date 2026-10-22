# Checklist de correo

- Capturar MX, SPF, DKIM y DMARC reales antes/después sin alterar valores.
- Enviar y recibir entre Workspace y dos proveedores externos; revisar spam y headers de autenticación.
- Confirmar que SPF/DKIM pasan y DMARC mantiene la política original.
- Verificar aliases/grupos críticos definidos por Studio Nomade.
- Si una prueba falla, restaurar registros afectados desde el export y escalar al administrador de Workspace.

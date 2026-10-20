# Rollback de deploy

Registrar SHA/deployment actual y síntoma. Revertir/promover en Vercel el último deployment verificado, sin reescribir Git ni cambiar DNS. Validar rutas críticas, leads y Admin. Si hubo migración, usar solo el down auditado cuando sea compatible con los datos; nunca borrar datos para acelerar rollback. Abrir corrección desde `testing`.

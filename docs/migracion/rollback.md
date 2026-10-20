# Rollback de migración

Disparadores: caída sostenida, SSL inválido, formularios sin persistencia, Admin inaccesible, afectación de correo o diferencia no aprobada. El operador restaura exclusivamente los registros modificados usando el export previo, conserva TTL/priority, limpia cachés solo si el proveedor lo indica y repite `dig`, HTTPS y pruebas de correo. Si correo o Noma se afectan, rollback inmediato. No existe export real aún; por tanto este procedimiento no está probado ni autoriza un cutover.

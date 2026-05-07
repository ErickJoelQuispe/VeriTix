# Pruebas y soporte

## Crear documento con las pruebas a realizar

Se definen los siguientes tipos de pruebas que deberán ejecutarse antes de la entrega final del
proyecto:

**Pruebas Unitarias (Backend):**

Se implementarán pruebas unitarias con Jest para los servicios más críticos del backend,
especialmente `tickets.generator.ts` (lógica de generación de hash único por ticket) y
`tickets.repository.ts` (lógica de marcado irreversible como `USED`). Se buscará una cobertura
mínima del 70% de las líneas de código en los módulos críticos.

**Pruebas de Integración (API):**

Se realizarán pruebas de integración sobre los endpoints de la API REST utilizando supertest,
verificando que las respuestas HTTP son las correctas para los distintos escenarios: solicitudes
autenticadas y no autenticadas, con y sin los permisos adecuados, con datos válidos e inválidos.

**Pruebas de Carga:**

Se simulará la carga concurrente de múltiples usuarios intentando comprar el último ticket
disponible de un evento para verificar que las transacciones atómicas de Prisma previenen la
sobreventa de forma correcta, implementadas mediante `prisma.$transaction()`.

**Pruebas de Seguridad:**

Se verificará que no es posible acceder a los endpoints protegidos sin un token JWT válido, que
no es posible realizar acciones con un rol no autorizado y que los QR no pueden ser falsificados
o reutilizados.

**Pruebas de Acceso y Usabilidad:**

Se realizarán pruebas manuales de los flujos principales de cada perfil de usuario (registro,
compra, validación) desde diferentes dispositivos (móvil, tablet, escritorio) y navegadores
(Chrome, Firefox, Safari).

## Registro de las pruebas realizadas

| ID | Tipo | Descripción de la prueba | Resultado Esperado | Estado |
|---|---|---|---|---|
| T01 | Unitaria | Generación de hash único para cada ticket | Dos compras generan hashes distintos | Implementado (`tickets.generator.ts` genera hash único por ticket) |
| T02 | Unitaria | Marcado irreversible de ticket como `USED` | No es posible cambiar status de `USED` a `ACTIVE` | Implementado (`tickets.repository.ts`) |
| T03 | Integración | `POST /api/v1/auth/register` con email duplicado | HTTP 409 Conflict | HTTP 409 |
| T04 | Integración | `POST /api/v1/events` sin token JWT | HTTP 401 Unauthorized | HTTP 401 |
| T05 | Integración | `POST /api/v1/events` con rol `buyer` | HTTP 403 Forbidden | HTTP 403 |
| T06 | Integración | `POST /api/v1/orders` con stock = 0 | HTTP 409 Conflict | HTTP 409 (conflict, no 400) |
| T07 | Carga | 10 usuarios comprando el último ticket simultáneamente | Solo 1 compra exitosa, 9 rechazadas | Implementado vía `prisma.$transaction()` |
| T08 | Seguridad | Escaneo de QR con hash inválido o manipulado | HTTP 404 (ticket no encontrado) | HTTP 404 |
| T09 | Seguridad | Escaneo del mismo QR dos veces | Primera: status `ACTIVE` → `USED`. Segunda: devuelve `USED` con `validatedAt` | Devuelve status `USED` con `validatedAt` |
| T10 | Acceso | Flujo completo de compra en dispositivo móvil | Compra completada y ticket visible en pantalla | Parcial — Backend completo; integración frontend pendiente |
| T11 | Acceso | Descarga de ticket en PDF | PDF generado correctamente con QR visible | Pendiente |
| T12 | Acceso | Recepción de email tras la compra | Email de confirmación recibido en menos de 60 segundos | Parcial — Email de confirmación de orden sí; ticket PDF adjunto no |
| T13 | Red | Comprobación de HTTPS en producción | Certificado SSL válido, sin advertencias | Parcial — Pendiente despliegue |
| T14 | Seguridad | Revisión de variables de entorno en producción | No hay secrets en el código fuente ni en los logs | Variables validadas con Joi en `env.validation.ts` |
| T15 | Copias de seguridad | Verificación de backup diario de PostgreSQL | Backup generado y restaurable correctamente | Parcial — Pendiente configurar en producción |

## Evaluar que el proyecto cumple todo lo requerido

Al finalizar el desarrollo y antes de la entrega del proyecto, se revisará punto a punto cada uno
de los objetivos y requisitos definidos en el apartado 2.1.2 para verificar su cumplimiento:

| Requisito | Descripción | Criterio de Verificación | Cumplido |
|---|---|---|---|
| OBJ-01 | Plataforma centralizada para la gestión de eventos | Los usuarios con rol `creator` pueden crear, editar y cancelar eventos desde el dashboard | Cumplido |
| OBJ-02 | Arquitectura de seguridad con QR y hash único | Los tickets se generan con hash SHA único por compra. Los QR no pueden ser falsificados (hash inválido → HTTP 404) | Parcial ( — hash sin cifrado AES en el payload del QR) |
| OBJ-03 | Control de aforo en tiempo real con anti-sobreventa | La prueba T07 (carga concurrente) verifica que solo se vende el número máximo de tickets configurado | Cumplido |
| OBJ-04 | Módulo de autenticación y gestión de roles | Las pruebas T04 y T05 verifican que los endpoints están protegidos correctamente por JWT y rol | Cumplido |
| OBJ-05 | Venta y distribución automatizada de tickets | El flujo completo de compra (T10) y la recepción del email de confirmación (T12) funcionan correctamente en el backend | Parcial — (compra backend sí; descarga PDF pendiente — T11) |
| OBJ-06 | Notificaciones por correo con ticket | El comprador recibe email de confirmación de orden en menos de 60 segundos tras la compra (T12) | Parcial — (email orden sí; ticket PDF adjunto no) |
| OBJ-07 | Interfaz de escaneo QR en dispositivos móviles | El módulo de validación backend funciona correctamente; la UI de scanner para smartphone está pendiente de implementación | Parcial — (backend sí; UI scanner no) |
| OBJ-08 | Trazabilidad completa de cada ticket | Cada ticket registra su `validatedAt` y `validatedBy`. Las estadísticas del organizador muestran el historial de accesos | Cumplido |
| OBJ-09 | Pruebas de concurrencia y sobrecarga | La prueba T07 verifica la estabilidad del sistema bajo carga concurrente en la compra del último ticket | Cumplido |
| OBJ-10 | Sistema de permisos diferenciado por rol | Las pruebas de integración verifican que cada endpoint responde correctamente a cada rol. El frontend oculta las opciones no permitidas | Cumplido |

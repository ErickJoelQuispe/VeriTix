# REQUIREMENTS — Implementado vs pendiente

Base de alcance: `docs/tfg.md`.

## Criterio

- **Implementado**: existe evidencia en código ejecutable (backend/frontend).
- **Pendiente**: solo se marca si el punto está explícito en `docs/tfg.md`.

## Requerimientos funcionales del TFG

## 2.1 Autenticación y usuarios

- **RF-01 Registro de usuarios** -> ✅ Implementado (`POST /api/v1/auth/register`).
- **RF-02 Inicio de sesión** -> ✅ Implementado (`POST /api/v1/auth/login`, refresh/logout).
- **RF-03 Gestión de roles** -> ✅ Implementado (enum `Role`, guard de roles, ABM admin).
- **RF-04 Recuperación de contraseña** -> ❌ Pendiente (no hay endpoint/flujo de reset por email; UI de `/forgot-password` lo declara explícitamente no disponible).

## 2.2 Eventos

- **RF-05 Creación de eventos** -> ✅ Implementado (`POST /api/v1/events`, roles CREATOR/ADMIN).
- **RF-06 Listado de eventos** -> ✅ Implementado (`GET /api/v1/events` público con filtros + paginación).
- **RF-07 Edición de eventos** -> ✅ Implementado parcialmente (hay `PATCH /events/:id`; restricciones exactas de “solo antes de venta” no están codificadas como regla explícita).
- **RF-08 Cancelación de eventos** -> ✅ Implementado (`DELETE /events/:id` como cambio a estado `CANCELLED`, admin).

## 2.3 Tipos de ticket

- **RF-09 Definición de tipos de ticket** -> ✅ Implementado (`/events/:eventId/ticket-types`).
- **RF-10 Gestión de disponibilidad** -> ✅ Implementado parcialmente (se controla stock por `availableQuantity`; no existe validación explícita en código para `Σ(ticketTypes) <= maxCapacity` al crear/editar tipos).

## 2.4 Tickets

- **RF-11 Compra de tickets** -> ✅ Implementado vía `orders` con reserva de stock y checkout Stripe.
- **RF-12 Generación de código QR** -> ✅ Implementado (se genera hash único y `qrPayload=hash`; no hay cifrado AES del payload en la implementación actual).
- **RF-13 Visualización de tickets** -> ✅ Implementado en backend (`GET /tickets/mine`, `GET /tickets/:id`) y modelo frontend para perfil/admin parcial.
- **RF-14 Envío de tickets por email tras compra** -> ⚠️ Parcial: se envía confirmación de orden, pero no existe envío explícito del ticket QR como adjunto/artefacto de ticket.
- **RF-15 Descarga PDF de tickets** -> ❌ Pendiente (no hay endpoint/flujo activo para descarga PDF de ticket).

## 2.5 Validación

- **RF-16 Escaneo de QR** -> ⚠️ Parcial: backend tiene validación por hash (`POST /tickets/validate`), pero no existe frontend scanner operativo.
- **RF-17 Validación de ticket** -> ✅ Implementado (control de estados ACTIVE/USED/CANCELLED/REFUNDED).
- **RF-18 Registro de acceso** -> ✅ Implementado (`validatedAt`, `validatedBy`, status `USED`).
- **RF-19 Respuesta de validación por estado/color** -> ⚠️ Parcial: backend devuelve errores/éxito, pero no está implementada UI de semáforo/scanner.
- **RF-20 Estadísticas de acceso en tiempo real** -> ❌ Pendiente específico de validación de accesos; existen métricas de ventas/capacidad por evento, no dashboard de accesos de puerta en tiempo real.

## Futuro (explícito en `tfg.md`, no implementado completo)

1. Recuperación de contraseña end-to-end (RF-04).
2. Flujo UX completo de escaneo/validación en frontend (RF-16 a RF-19).
3. Descarga de tickets en PDF para usuario final (RF-15).
4. Estadísticas de acceso en tiempo real centradas en validación de ingreso (RF-20).

## Evidencia principal

- Backend: `backend/src/modules/*`
- Frontend rutas/pages: `frontend/app/pages/*`, `frontend/server/api/*`
- Datos: `backend/prisma/schema.prisma`

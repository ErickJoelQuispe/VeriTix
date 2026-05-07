# STATUS — VeriTix

**Fecha de actualización:** 2026-04-25

## Snapshot actual

## Stack real

- **Frontend:** Nuxt 4 + Vue 3 + Nuxt UI + Tailwind 4 (`frontend/package.json`, `frontend/nuxt.config.ts`)
- **Backend:** NestJS 11 + Prisma 7 + PostgreSQL + Redis (`backend/package.json`, `backend/src/app.module.ts`)
- **Auth:** JWT access token + refresh token en cookie HTTP-only con rotación (`backend/src/modules/auth/*`)
- **Pagos:** Stripe Checkout + webhooks (`backend/src/modules/orders/orders.service.ts`, `backend/src/modules/webhooks/*`)
- **Notificaciones:** Resend (email verificación, confirmación, reembolso, recordatorios) (`backend/src/modules/notifications/notifications.service.ts`)
- **Colas:** BullMQ para reminders (`backend/src/modules/queues/*`)

## Estado por áreas

### Backend API

- ✅ Autenticación (register, login, refresh, logout, verify-email)
- ✅ Usuarios (perfil propio + ABM admin)
- ✅ Eventos (catálogo público, CRUD creator/admin, publish, analytics)
- ✅ Catálogos (venues, genres, concert-formats, artists)
- ✅ Compras (orders con reserva de stock + Stripe checkout)
- ✅ Tickets (consulta y validación por hash)
- ✅ Webhook Stripe para completar/cancelar/reembolsar flujo

### Frontend

- ✅ Catálogo público de eventos (`/events`, `/events/[id]`)
- ✅ Login/registro/logout y perfil (`/login`, `/register`, `/users/me`)
- ✅ Panel admin para usuarios, artistas y eventos (`/admin/...`)
- ⚠️ Recuperación de contraseña: **UI informativa, sin flujo real** (`frontend/app/pages/forgot-password.vue`, `frontend/app/components/auth/RecoveryPanel.vue`)
- ⚠️ No hay integración frontend para compra/órdenes/tickets/validación (no existen rutas Nitro para `/orders` ni `/tickets` en `frontend/server/api/`)

### Base de datos

- ✅ Schema Prisma consolidado con dominios: users, auth tokens, venues, formats, genres, artists, events, ticket types, orders, tickets, payments (`backend/prisma/schema.prisma`)
- ✅ Índices compuestos y unicidad definidos en Prisma

## Deudas / inconsistencias conocidas

1. **Registro frontend vs backend desalineado**
   - Frontend intenta login automático luego de register (`frontend/app/composables/useAuth.ts`)
   - Backend requiere verificación de email antes de login (`backend/src/modules/auth/auth.service.ts`)

2. **Tipos de paginación desalineados entre frontend y backend**
   - Backend usa `meta.total`, `hasNext`, `hasPrev` (`backend/src/common/dto/paginated-response.dto.ts`)
   - `shared/types` frontend espera `totalItems`, `hasNextPage`, etc. (`frontend/shared/types/api.ts`)

3. **Moneda por defecto desalineada**
   - Backend default de eventos: `MXN` (`backend/prisma/schema.prisma`)
   - Frontend limita `CurrencyCode` a `USD | EUR | COP` (`frontend/app/types/domain.ts`)

4. **Cache key incompleta para artistas**
   - `CACHE_KEYS.ARTISTS_LIST` solo usa página/límite y no filtros (`backend/src/cache/cache-keys.ts`, `backend/src/modules/artists/artists.service.ts`)

## Futuro (solo explícito en `docs/tfg.md`)

- Flujo real de recuperación de contraseña por email (RF-04).
- Flujo completo de validación QR en UI de scanner (RF-16 a RF-19).
- Descarga de tickets en PDF para usuario final (RF-15).

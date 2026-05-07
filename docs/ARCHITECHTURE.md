# ARCHITECHTURE — VeriTix (estado implementado)

## 1) Vista general

VeriTix es un monorepo con dos apps:

- `frontend/`: Nuxt 4 (SSR) con rutas internas Nitro (`frontend/server/api/*`).
- `backend/`: NestJS con API REST versionada bajo prefijo global (`/api/v1`).

El frontend **no** consume directamente al backend desde browser para auth/CRUD principal: usa proxy server-side en Nitro (`frontend/server/utils/backend-proxy.ts`).

## 2) Boundaries y responsabilidades

## Frontend (Nuxt)

- Render de UI y middleware de acceso (`frontend/app/middleware/*`).
- Estado de sesión en `useAuth` con access token en memoria de estado (`frontend/app/composables/useAuth.ts`).
- Proxy HTTP a backend y forwarding de cookies/authorization (`frontend/server/utils/backend-proxy.ts`).
- Cache HTTP pública para endpoints de catálogo en Nitro (`frontend/server/utils/cache/*`).

## Backend (Nest)

- Reglas de negocio y persistencia (`backend/src/modules/*`).
- Seguridad global: `JwtAuthGuard` + `RolesGuard` como `APP_GUARD` (`backend/src/modules/auth/auth.module.ts`).
- Validación de payloads con `ValidationPipe` global (`backend/src/main.ts`).
- Persistencia con Prisma (`backend/src/prisma/*`).
- Integración Stripe checkout + webhooks (`backend/src/modules/orders`, `backend/src/modules/webhooks`).

## 3) Seguridad y autenticación

## Flujo actual

1. Login: backend devuelve `accessToken` en body + setea `refresh_token` HTTP-only cookie (`backend/src/modules/auth/auth.controller.ts`).
2. Access token se envía por `Authorization: Bearer ...`.
3. Refresh token se rota en `/auth/refresh` y se valida contra DB (`refresh_tokens`).

## Detalles relevantes

- Access JWT firmado HS256 con `JWT_SECRET` y expiración configurable (default `15m`) (`backend/src/modules/auth/jwt-token.service.ts`).
- Refresh JWT con secreto separado y default `7d`; jti almacenado en DB (`refresh_tokens`).
- Cookie refresh backend usa `path=/auth`, pero Nitro la reescribe a `path=/api/auth` para cliente frontend (`frontend/server/utils/backend-proxy.ts`).
- Endpoints públicos marcados con `@Public()`; resto requiere JWT válido.

## 4) Flujo de datos principal

## Catálogo público de eventos

`Browser -> Nuxt /api/events -> proxy -> Backend /api/v1/events -> Prisma`

- Backend filtra solo eventos `PUBLISHED` para listado público (`backend/src/modules/events/events.repository.ts`).
- Detalle de evento `DRAFT` solo visible para owner/admin (`backend/src/modules/events/events.service.ts`).

## Compra y emisión de tickets

`POST /orders` crea orden `PENDING`, reserva stock y crea Stripe session (`backend/src/modules/orders/orders.service.ts`).

Luego webhook:

- `checkout.session.completed` -> payment COMPLETED + order COMPLETED + generación de tickets (`tickets.generator.ts`).
- `checkout.session.expired` -> rollback de stock + order CANCELLED.
- `charge.refunded` -> order/payment REFUNDED + tickets REFUNDED.

## Validación en acceso

- Endpoint: `POST /tickets/validate` (roles ADMIN/VALIDATOR).
- Busca por hash, exige estado `ACTIVE`, marca `USED` + `validatedAt` + `validatedBy`.

## 5) Manejo de errores

- Backend normaliza errores por excepciones Nest (`UnauthorizedException`, `ConflictException`, etc.).
- Nitro proxy preserva status code y mensaje backend (`normalizeBackendError` en `frontend/server/utils/backend-proxy.ts`).
- DTOs validados con whitelist + forbidNonWhitelisted (`backend/src/main.ts`).

## 6) Cache y performance

## Backend

- CacheManager global con Redis (fallback silencioso si Redis falla) (`backend/src/cache/cache.module.ts`, `cache.service.ts`).
- TTLs reales:
  - corto: 2 min
  - medio: 5 min
  - largo: 1 hora

## Frontend Nitro

- Cache-control para APIs públicas (`frontend/server/utils/cache/http.ts`).
- Políticas por query normalizada y por route params (`frontend/server/utils/cache/policies/public-api.ts`).

## 7) Configuración y entorno

Variables críticas validadas por Joi (`backend/src/config/env.validation.ts`):

- `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AES_SECRET_KEY`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `RESEND_API_KEY`, `EMAIL_FROM`

En frontend (`frontend/nuxt.config.ts`):

- `NUXT_BACKEND_API_BASE` (default `http://localhost:3001/api/v1`)
- `NUXT_PUBLIC_API_BASE` (default `${NUXT_APP_BASE_URL}/api`)
- `NUXT_PUBLIC_API_TIMEOUT_MS`

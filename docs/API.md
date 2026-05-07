# API — VeriTix

## Convenciones base

- **Backend base URL:** `/api/v1` (global prefix en `backend/src/main.ts`).
- **Frontend API interna (Nitro):** `/api/*` (proxy en `frontend/server/api/*`).
- Nitro reenvía `Authorization` y `Cookie`, y propaga `set-cookie` del backend (`frontend/server/utils/backend-proxy.ts`).

---

## 1) Rutas internas de frontend (Nitro)

## Auth

- `POST /api/auth/register` -> backend `POST /auth/register`
- `POST /api/auth/login` -> backend `POST /auth/login`
- `POST /api/auth/refresh` -> backend `POST /auth/refresh`
- `POST /api/auth/logout` -> backend `POST /auth/logout`

## Usuario autenticado

- `GET /api/users/me` -> backend `GET /users/me`
- `PATCH /api/users/me` -> backend `PATCH /users/me`
- `PATCH /api/users/me/password` -> backend `PATCH /users/me/password`

## Catálogo público

- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/genres`
- `GET /api/venues` (Nitro fija `page=1&limit=100&isActive=true`)
- `GET /api/concert-formats`

## Admin (proxy de backend)

### Eventos

- `GET /api/admin/events`
- `POST /api/admin/events`
- `GET /api/admin/events/my-events`
- `GET /api/admin/events/upcoming`
- `GET /api/admin/events/requires-attention`
- `GET /api/admin/events/top-events`
- `GET /api/admin/events/:id`
- `PATCH /api/admin/events/:id`
- `DELETE /api/admin/events/:id`
- `GET /api/admin/events/:id/metrics`
- `POST /api/admin/events/:id/publish`

### Usuarios

- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Artistas

- `GET /api/admin/artists`
- `POST /api/admin/artists`
- `GET /api/admin/artists/:id`
- `PATCH /api/admin/artists/:id`
- `DELETE /api/admin/artists/:id`

> Evidencia: `frontend/server/api/**/*.ts`

---

## 2) Backend REST (Nest)

## Autenticación (`/api/v1/auth`)

- `POST /register`  
  Request: `{ email, password, name, lastName, phone }`  
  Response: `{ message }` (no devuelve tokens en register)

- `POST /login`  
  Request: `{ email, password }`  
  Response: `{ accessToken, user }` + cookie `refresh_token`

- `GET /verify-email?token=...` -> `{ message }`
- `POST /refresh` -> `{ accessToken, user }` + rotación cookie
- `POST /logout` -> `204 No Content`

## Usuarios (`/api/v1/users`)

- `GET /me`, `PATCH /me`, `PATCH /me/password` (autenticado)
- Admin: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`

## Eventos (`/api/v1/events`)

- Público: `GET /`, `GET /:id`
- Creator/Admin: `POST /`, `PATCH /:id`, `POST /:id/publish`, `GET /:id/metrics`, `GET /upcoming`, `GET /requires-attention`, `GET /my-events`
- Admin only: `DELETE /:id`, `GET /top-events`

### Subrecursos de evento

- Ticket types: `/api/v1/events/:eventId/ticket-types` (GET público, mutaciones creator/admin)
- Event artists: `/api/v1/events/:eventId/artists` (GET público, mutaciones creator/admin)

## Catálogos

- `GET/POST/PATCH/DELETE /api/v1/venues` (GET público, resto admin)
- `GET/POST/PATCH/DELETE /api/v1/genres` (GET público, resto admin)
- `GET/POST/PATCH/DELETE /api/v1/concert-formats` (GET público, resto admin)
- `GET/POST/PATCH/DELETE /api/v1/artists` (GET público, resto admin)

## Órdenes (`/api/v1/orders`)

- `POST /` crear orden de compra + Stripe checkout URL
- `GET /my` órdenes del usuario autenticado
- `GET /:id` owner o admin
- `PATCH /:id/cancel` owner o admin (solo PENDING)
- `GET /event/:eventId` creator del evento o admin

## Tickets (`/api/v1/tickets`)

- `GET /mine` tickets propios
- `GET /event/:eventId` tickets del evento (creator/admin)
- `GET /:id` ticket puntual (owner/admin)
- `POST /validate` validación por hash (admin/validator)

## Webhooks (`/api/v1/webhooks`)

- `POST /stripe` (excluido de Swagger, firma Stripe obligatoria)

> Evidencia: controllers en `backend/src/modules/**/*controller.ts`

---

## 3) Contratos principales

## 3.1 Login

Request:

```json
{ "email": "user@mail.com", "password": "Password123" }
```

Response:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@mail.com",
    "name": "Nombre",
    "lastName": "Apellido",
    "role": "BUYER",
    "avatarUrl": null
  }
}
```

## 3.2 Crear orden

Request:

```json
{
  "eventId": "uuid",
  "items": [{ "ticketTypeId": "uuid", "quantity": 2 }]
}
```

Response (resumen):

```json
{
  "id": "uuid",
  "status": "PENDING",
  "totalAmount": 150,
  "items": [ ... ],
  "payments": [ ... ],
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

## 3.3 Validar ticket

Request:

```json
{ "hash": "64_hex_chars" }
```

Response:

```json
{
  "ticketId": "uuid",
  "eventName": "...",
  "ticketTypeName": "...",
  "buyerName": "...",
  "validatedAt": "ISO-date"
}
```

---

## 4) Seguridad API

- Guards globales: JWT + roles (`backend/src/modules/auth/auth.module.ts`).
- Rutas públicas explícitas con `@Public()`.
- Refresh token solo por cookie HTTP-only, no por body.
- CORS con `credentials: true` (`backend/src/main.ts`).
- Rate limiting global con `ThrottlerGuard` (`backend/src/app.module.ts`).
- Webhook Stripe valida firma con `STRIPE_WEBHOOK_SECRET`.

# Modelado de la solución

## Arquitectura general del sistema

VeriTix adopta arquitectura cliente-servidor desacoplada en monorepo. El frontend consume
exclusivamente la API REST del backend.

| Aspecto               | Backend                                    | Frontend                        |
| --------------------- | ------------------------------------------ | ------------------------------- |
| Framework             | NestJS 11                                  | Nuxt 4 / Vue 3                  |
| Puerto local habitual | 3001                                       | 3000                            |
| Responsabilidad       | Lógica de negocio, seguridad, persistencia | UI, navegación y consumo de API |
| Persistencia          | Prisma 7 + PostgreSQL                      | Sin acceso directo a BD         |

## Módulos backend

La implementación backend se organiza en dominios funcionales claramente delimitados:

| Dominio funcional          | Módulos                                             |
| -------------------------- | --------------------------------------------------- |
| Identidad y acceso         | `auth`, `users`                                     |
| Catálogo y eventos         | `events` (incluye `ticket-types` y `event-artists`) |
| Transacción y emisión      | `orders`, `tickets`, `webhooks`                     |
| Comunidad y postventa      | `favorites`, `reviews`, `ticket-transfers`          |
| Adjuntos y multimedia      | `uploads`                                            |
| Infraestructura de dominio | `venues`, `artists`, `genres`, `concert-formats`    |
| Soporte operativo          | `notifications`, `queues`, `cache`                  |

## API real del sistema

El backend aplica prefijo global configurable mediante `API_PREFIX` y, en ausencia de valor en
entorno, utiliza `api/v1` (`backend/src/main.ts`). Por tanto, las rutas públicas/protegidas se
consumen como `/api/v1/...`.

Los contratos siguientes se extrajeron de controladores y DTOs del repositorio. Se resumen en
tablas compactas para mantener la legibilidad del PDF.

## Autenticación

| Endpoint                   | Seguridad             | Resumen funcional                                     |
| -------------------------- | --------------------- | ----------------------------------------------------- |
| POST /api/v1/auth/register | Pública               | Alta usuario y devuelve mensaje de verificación       |
| POST /api/v1/auth/login    | Pública               | Recibe credenciales y devuelve token + cookie refresh |
| GET /api/v1/auth/session   | Cookie refresh válida | Devuelve sesión activa para bootstrap sin rotar cookie |
| GET /api/v1/auth/verify-email | Pública            | Verifica cuenta mediante token de email               |
| POST /api/v1/auth/refresh  | Cookie refresh válida | Emite nuevo access token y rota cookie                |
| POST /api/v1/auth/logout   | JWT + cookie refresh  | Revoca refresh token y limpia cookie (204)            |
| POST /api/v1/auth/forgot-password | Pública             | Solicita enlace de restablecimiento (respuesta neutra) |
| POST /api/v1/auth/reset-password  | Pública             | Restablece contraseña con token válido                 |

## Eventos y catálogo

| Endpoint                                  | Seguridad               | Resumen funcional                      |
| ----------------------------------------- | ----------------------- | -------------------------------------- |
| GET /api/v1/events                        | Pública                 | Lista eventos con paginación y filtros |
| POST /api/v1/events                       | JWT + rol ADMIN/CREATOR | Crea evento                            |
| POST /api/v1/events/:id/publish           | JWT + rol ADMIN/CREATOR | Publica evento existente               |
| POST /api/v1/events/:eventId/ticket-types | JWT + rol ADMIN/CREATOR | Crea tipo de ticket para un evento     |

## Órdenes, tickets y pagos

| Endpoint                      | Seguridad                     | Resumen funcional                              |
| ----------------------------- | ----------------------------- | ---------------------------------------------- |
| POST /api/v1/orders           | JWT usuario autenticado       | Crea orden y retorna checkoutUrl cuando aplica |
| GET /api/v1/orders/my         | JWT usuario autenticado       | Lista órdenes del comprador                    |
| GET /api/v1/tickets/mine      | JWT usuario autenticado       | Lista tickets del comprador                    |
| POST /api/v1/tickets/validate | JWT + rol ADMIN/VALIDATOR     | Valida ticket por hash y registra trazabilidad |
| POST /api/v1/webhooks/stripe  | Firma stripe-signature válida | Procesa evento de pago/reembolso               |

## Funcionalidades sociales y soporte

| Endpoint                                           | Seguridad                 | Resumen funcional                                  |
| -------------------------------------------------- | ------------------------- | -------------------------------------------------- |
| POST /api/v1/favorites/events/:eventId             | JWT + rol BUYER           | Alterna estado favorito (alta/baja) por evento     |
| GET /api/v1/favorites/events                       | JWT + rol BUYER           | Lista paginada de favoritos del usuario            |
| GET /api/v1/favorites/events/:eventId              | JWT + rol BUYER           | Consulta si un evento está en favoritos            |
| POST /api/v1/reviews                               | JWT + rol BUYER           | Crea reseña de evento                              |
| PATCH /api/v1/reviews/:id                          | JWT + rol BUYER           | Actualiza reseña propia                            |
| DELETE /api/v1/reviews/:id                         | JWT + rol BUYER/ADMIN     | Elimina reseña (autor o admin)                     |
| POST /api/v1/ticket-transfers                      | JWT usuario autenticado   | Inicia transferencia de ticket                     |
| GET /api/v1/ticket-transfers/accept?token=...      | Pública (JWT opcional)    | Acepta transferencia vía token                     |
| POST /api/v1/ticket-transfers/:id/cancel           | JWT usuario autenticado   | Cancela transferencia iniciada                     |
| POST /api/v1/ticket-transfers/complete-after-register | JWT + rol BUYER        | Completa transferencia tras registro del receptor  |
| POST /api/v1/uploads/sign                          | JWT usuario autenticado   | Genera firma de subida directa a Cloudinary        |

## Modelo de datos y constraints

El esquema Prisma (`backend/prisma/schema.prisma`) se organiza en dos bloques:

| Bloque               | Entidades                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| Núcleo transaccional | User, RefreshToken, Event, TicketType, Order, OrderItem, Ticket, Payment. |
| Catálogos y soporte  | Venue, Artist, Genre, ConcertFormat, EventArtist.                         |
| Comunidad y postventa| Favorite, Review, TicketTransfer.                                         |

## Relaciones principales verificables

| Relación                              | Cardinalidad |
| ------------------------------------- | -----------: |
| User (creator) con Event              |          1:N |
| Event con TicketType, Order y Ticket  |          1:N |
| Order con OrderItem, Payment y Ticket |          1:N |
| TicketType con OrderItem y Ticket     |          1:N |
| User (buyer) con Order y Ticket       |          1:N |
| Event con Artist mediante EventArtist |          N:M |
| Event con Genre y Artist con Genre    |          N:M |

## Constraints e índices relevantes

| Tipo de restricción         | Detalle                                                                                                                                                             |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unicidad                    | `users.email`, `users.phone`, `tickets.hash`, `venues.slug`, `artists.slug`, `genres.name/slug`, `concert_formats.name/slug`, `event_artists(event_id, artist_id)`. |
| Integridad referencial (FK) | Presente en las relaciones críticas (`event_id`, `buyer_id`, `order_id`, etc.).                                                                                     |
| Cascadas de borrado         | `RefreshToken→User`, `EventArtist→Event`, `TicketType→Event`, `OrderItem→Order`, `Ticket→Event`.                                                                    |
| Índices de consulta         | `events(status, eventDate)`, `orders(buyerId, createdAt)`, `orders(eventId, status)`, `tickets(buyerId, status)`, `tickets(eventId, status)`.                       |
| Enums de dominio            | `Role`, `EventStatus`, `OrderStatus`, `TicketStatus`, `PaymentStatus`, `VenueType`, `ArtistRole`, `TransferStatus`.                                                 |

## Seguridad y control de integridad

| Mecanismo                    | Función                                                 |
| ---------------------------- | ------------------------------------------------------- |
| JWT + refresh token rotativo | Autenticación y renovación segura de sesión.            |
| Joi en `env.validation.ts`   | Validación de variables de entorno críticas.            |
| `prisma.$transaction()`      | Aislamiento de operaciones críticas de compra.          |
| Hash SHA-256 por ticket      | Identificación y validación del ticket vía `qrPayload`. |

## Puntos de control para validación del proyecto

| Punto de control                 | Verificación                               |
| -------------------------------- | ------------------------------------------ |
| Integridad y unicidad del ticket | Validación de uso único en acceso.         |
| Prevención de sobreventa         | Consistencia bajo concurrencia.            |
| Control de acceso por rol        | Protección de endpoints sensibles.         |
| Auditoría de validación          | Registro de `validatedAt` y `validatedBy`. |
| Confirmación de pago             | Webhook y emisión de notificaciones.       |

## Diagrama entidad-relación

::: {.latex-figure height="0.55\\textheight" stretch="true"}

![Vista general del diagrama ER](build/assets/er-overview.pdf)

:::

::: {.latex-figure needspace="16"}

![Dominio transaccional del sistema](build/assets/er-core-transaccional.pdf)

:::

:::pagebreak
:::

## Contenerización y despliegue operativo

La solución está containerizada y preparada para operarse en una VPS con servicios aislados.
El backend levanta PostgreSQL, Redis y la API en contenedores separados; el frontend usa un
`Dockerfile` multi-stage con runtime no-root.

**Frontend (Dockerfile multi-stage):**

```dockerfile
FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
USER nuxt
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
```

**Backend (orquestación de servicios):**

```yaml
services:
    postgres:
        image: postgres:18-alpine
        restart: unless-stopped
        ports:
            - '127.0.0.1:5432:5432'

    redis:
        image: redis:8-alpine
        restart: unless-stopped
        ports:
            - '127.0.0.1:6379:6379'

    backend:
        build:
            dockerfile: Dockerfile.dev
        ports:
            - '3001:3001'
```

## Ficheros de configuración relevantes

- `backend/.env.example`: variables necesarias del backend (`DATABASE_URL`, secrets JWT,
  Stripe, Resend, Redis, CORS, etc.).
- `backend/prisma/schema.prisma`: modelo de datos y restricciones.
- `docker-compose.yml`: orquestación raíz del monorepo.
- `backend/docker-compose.yml` y `frontend/docker-compose.yml`: configuración específica por paquete.

## Configuración de la API

- API con prefijo global `/api/v1`.
- Documentación Swagger activa en `/docs`.
- Webhook de Stripe en `/api/v1/webhooks/stripe` con `rawBody` habilitado para firma.
- Seguridad con `helmet`, `cookie-parser`, validación global y guards.

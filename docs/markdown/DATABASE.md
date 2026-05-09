# DATABASE — Modelo de datos real (Prisma)

Fuente de verdad: `backend/prisma/schema.prisma`.

## Stack de persistencia

- Motor: **PostgreSQL** (`datasource db`, provider `postgresql`).
- ORM/cliente: **Prisma 7** (`@prisma/client`, `prisma` en `backend/package.json`).
- Cliente generado en: `backend/src/generated/prisma`.

## Enums implementados

- `Role`: `BUYER | CREATOR | VALIDATOR | ADMIN`
- `EventStatus`: `DRAFT | PUBLISHED | FINISHED | CANCELLED`
- `TicketStatus`: `ACTIVE | USED | CANCELLED | REFUNDED`
- `OrderStatus`: `PENDING | COMPLETED | CANCELLED | REFUNDED`
- `VenueType`: `ESTADIO | ARENA | FORO | AUDITORIO | CLUB | TEATRO | AL_AIRE_LIBRE | OTRO`
- `ArtistRole`: `HEADLINER | SPECIAL_GUEST | OPENER`
- `PaymentStatus`: `PENDING | COMPLETED | FAILED | REFUNDED`

## Entidades y relaciones (implementadas)

### Núcleo de identidad

- `users` (`User`)
  - Unicidad: `email`, `phone`.
  - Campos relevantes: `role`, `is_active`, `email_verified`, tokens de verificación/reset.
- `refresh_tokens` (`RefreshToken`)
  - `id` = `jti` del JWT de refresh.
  - Relación `N:1` a `users` con `onDelete: Cascade`.

### Catálogo de conciertos

- `venues` (`Venue`) — recintos reutilizables.
- `concert_formats` (`ConcertFormat`) — formato del show.
- `genres` (`Genre`) — géneros musicales.
- `artists` (`Artist`) — artistas.
- `events` (`Event`) — evento principal.
- `event_artists` (`EventArtist`) — junction Event↔Artist con rol/orden.
  - Constraint: `@@unique([eventId, artistId])`.

Relaciones clave:
- `User (creator) 1:N Event`
- `Venue 1:N Event`
- `ConcertFormat 1:N Event`
- `Genre N:M Event`
- `Genre N:M Artist`
- `Event 1:N EventArtist` y `Artist 1:N EventArtist`

### Tickets y pagos

- `ticket_types` (`TicketType`) — tipos de entrada por evento.
- `orders` (`Order`) — compra agregada por usuario/evento.
- `order_items` (`OrderItem`) — líneas por tipo/cantidad/precio.
- `tickets` (`Ticket`) — entradas unitarias emitidas (con hash QR único).
- `payments` (`Payment`) — estado de pago (Stripe).

Relaciones clave:
- `User (buyer) 1:N Order`
- `Order 1:N OrderItem`
- `Order 1:N Ticket`
- `Order 1:N Payment`
- `TicketType 1:N OrderItem`
- `TicketType 1:N Ticket`
- `Event 1:N TicketType`, `Event 1:N Order`, `Event 1:N Ticket`
- `User (validator) 1:N Ticket` vía `validated_by`

## Constraints e índices reales

> Solo se listan los definidos en `schema.prisma`.

### Uniques relevantes

- `users.email`, `users.phone`
- `venues.slug`
- `concert_formats.name`, `concert_formats.slug`
- `genres.name`, `genres.slug`
- `artists.slug`
- `event_artists(event_id, artist_id)`
- `tickets.hash`
- `payments.provider_payment_id`, `payments.provider_session_id`

### Índices relevantes

- `refresh_tokens(user_id)`
- `venues(city, type)`
- `event_artists(event_id, role)`, `event_artists(artist_id)`
- `events(status, event_date)`, `events(status, event_date, format_id)`, `events(creator_id)`, `events(venue_id)`
- `ticket_types(event_id, is_active)`
- `orders(buyer_id, created_at)`, `orders(event_id, status)`
- `order_items(order_id)`
- `tickets(buyer_id, status)`, `tickets(event_id, status)`, `tickets(hash)`
- `payments(order_id)`, `payments(provider_payment_id)`

## Reglas de negocio persistidas (observables en schema + servicios)

- Tickets se generan por unidad y guardan `hash` único + `qr_payload` (`tickets.generator.ts`).
- Validación de ticket registra `validated_at` y `validated_by` (`tickets.repository.ts`).
- Órdenes modelan ciclo `PENDING -> COMPLETED/CANCELLED/REFUNDED` (servicios de órdenes y webhooks).

## Lo que NO está implementado en schema (importante)

- No hay columnas `tsvector` ni índices GIN para búsqueda full-text.
- No hay índices parciales tipo `WHERE status = 'ACTIVE'`.
- No hay triggers/procedimientos SQL custom declarados en Prisma.

Si se documentan optimizaciones de ese tipo, deben figurar primero en migraciones reales (`backend/prisma/migrations/*`).

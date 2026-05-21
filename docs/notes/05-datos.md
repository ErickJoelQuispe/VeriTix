# Guion — Modelo de datos

## Contexto para el presentador

Esta diapositiva muestra las relaciones principales del modelo de datos. No hace falta explicar cada tabla, sino destacar la lógica de negocio que refleja.

## Qué decir

"El modelo de datos refleja la lógica del negocio. Las relaciones principales son:

Un usuario puede ser creador de eventos. Un evento tiene tipos de entrada —general, VIP, etcétera— y genera órdenes y tickets.

Cuando un comprador realiza una orden, esa orden contiene ítems y un pago asociado. Los tickets se emiten dentro de esa orden.

Cada ticket tiene un tipo de entrada asociado. Esto nos permite saber qué tipo de entrada compró cada persona.

Y la relación entre eventos y artistas es muchos a muchos: un evento puede tener varios artistas y un artista puede participar en varios eventos. Esto se gestiona a través de una tabla intermedia llamada EventArtist.

En cuanto a las restricciones clave: tenemos unicidad en email de usuario, teléfono, hash de ticket y slug de recinto. Esto garantiza que no haya duplicados.

Los enums del dominio —Role, EventStatus, OrderStatus, TicketStatus, PaymentStatus— definen los estados posibles de cada entidad. No se pueden asignar valores inválidos.

Y las cascadas garantizan que si se elimina un evento, se eliminan sus tipos de entrada y órdenes asociadas. Esto mantiene la integridad referencial."

## Tiempo estimado

2–3 minutos

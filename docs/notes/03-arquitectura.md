# Guion — Arquitectura del sistema

## Contexto para el presentador

La diapositiva muestra la separación de capas y los módulos del backend. Explicar la arquitectura de forma visual, no técnica.

## Qué decir

"La arquitectura de VeriTix sigue una separación clara de dos capas.

Del lado del frontend tenemos la aplicación web que usan compradores, organizadores y administradores según su perfil. Está construida con Nuxt 4 y Vue 3, y se comunica con el backend a través de una API REST.

La API está documentada con Swagger y accesible desde la ruta /docs. Esto facilita que cualquier desarrollador entienda cómo integrarse.

El backend está organizado por módulos de dominio. Cada módulo se encarga de una parte concreta del negocio:

- Identidad y acceso: registro de usuarios, inicio de sesión, roles.
- Catálogo y eventos: creación y gestión de eventos, tipos de entrada, artistas.
- Transacción y emisión: compra de tickets, generación de entradas, webhooks de pago.
- Infraestructura: recintos, artistas, géneros musicales, formatos de evento.
- Soporte operativo: notificaciones por email, colas de procesamiento, caché.

En cuanto a seguridad, usamos JWT con refresh token rotativo almacenado en cookies HTTP-only. Esto significa que incluso si alguien intercepta el token, no puede reutilizarlo por mucho tiempo.

Manejamos cuatro roles de usuario: comprador, organizador, validador y administrador. Cada uno tiene permisos específicos.

Las transacciones críticas, como la venta de un ticket, se ejecutan dentro de transacciones atómicas de Prisma. Esto garantiza que si algo falla a mitad del proceso, todo se deshace y no quedan datos inconsistentes.

Y cada ticket tiene un hash único generado con SHA-256 que se incrusta en el código QR. Ese hash es la firma digital del ticket."

## Tiempo estimado

3–4 minutos

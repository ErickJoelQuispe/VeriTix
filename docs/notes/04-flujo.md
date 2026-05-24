# Guion — Flujo principal del sistema

## Contexto para el presentador

Esta diapositiva recorre el flujo completo desde que un comprador se registra hasta que accede al evento. La demostración en vivo que viene después cubrirá esto visualmente.

## Qué decir

"Este es el flujo principal de VeriTix, paso a paso.

Primero, el usuario se registra en la plataforma. Recibe un email de verificación que enviamos a través de Resend, encolado con BullMQ para no bloquear la respuesta.

Después, el usuario elige sus entradas y paga. Cuando crea la orden, el sistema verifica el stock disponible dentro de una transacción atómica para evitar sobreventas. Luego redirige al comprador a Stripe Checkout para pagar de forma segura.

Stripe confirma el pago mediante un webhook. Ahí el sistema marca la orden como completada, genera los tickets con su hash único, reduce el stock y envía el email de confirmación con el código QR.

El día del evento, el validador escanea el QR de cada ticket desde su dispositivo. El sistema verifica que el hash sea válido y que el ticket no se haya usado antes, registrando la validación al instante.

El punto crítico de todo este flujo es la prevención de sobreventa. Lo logramos con tres pasos: verificar el stock disponible dentro de la transacción, decrementar el contador atómicamente, y solo confirmar la venta cuando Stripe valida el pago."

## Tiempo estimado

2–3 minutos

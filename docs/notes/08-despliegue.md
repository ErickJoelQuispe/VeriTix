# Guion — Despliegue y contenerización

## Contexto para el presentador

Esta diapositiva muestra cómo se despliega el sistema. No hace falta leer cada línea del Dockerfile, sino explicar el concepto general.

## Qué decir"

"El sistema completo se ejecuta en contenedores Docker. Tenemos cuatro servicios: PostgreSQL para la base de datos, Redis para caché y colas, el backend NestJS y el frontend Nuxt.

El frontend usa un Dockerfile multi-stage: primero instalamos dependencias, después construimos la aplicación, y finalmente generamos una imagen de producción ligera que solo contiene lo necesario para ejecutarse.

Las variables de entorno se configuran externamente, nunca en el repositorio. Esto incluye la conexión a base de datos, las claves de Stripe y Resend, y la configuración de CORS.

El comando `docker compose up -d` levanta todo el entorno completo."

## Tiempo estimado

1–2 minutos

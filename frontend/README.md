# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docker

Se ha añadido un setup Docker con dos perfiles: desarrollo y producción.

### Desarrollo (HMR)

Desde `frontend/`:

```bash
docker compose --profile dev up --build frontend-dev
```

- URL: `http://localhost:3000`
- HMR habilitado con bind mount del código y polling para compatibilidad cross-OS.
- El contenedor ejecuta `bun install --frozen-lockfile` al arrancar para evitar dependencias obsoletas en el volumen de `node_modules`.

Si cambias ramas o tocas dependencias y notas comportamiento extraño, resetea volúmenes:

```bash
docker compose --profile dev down -v
docker compose --profile dev up --build frontend-dev
```

### Producción

Desde `frontend/`:

```bash
docker compose --profile prod up --build frontend
```

- URL: `http://localhost:3000`
- Imagen optimizada con Dockerfile multi-stage y runtime no-root.

### Notas

- `Dockerfile` define targets `development` y `production`.
- `.dockerignore` reduce el contexto de build para acelerar y minimizar transferencias.

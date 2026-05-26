FROM oven/bun:1-alpine AS base
WORKDIR /app

# ── Builder: instala todas las deps (dev incluidas) y compila ────────────────
FROM base AS builder
COPY package.json bun.lock ./
# NODE_ENV debe estar ausente aquí para que bun instale devDependencies
# (TypeScript, Vite, etc. son necesarias para compilar)
RUN bun install --frozen-lockfile

COPY . .

ARG NUXT_APP_BASE_URL=/
ENV NUXT_APP_BASE_URL=$NUXT_APP_BASE_URL

ARG NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

# Limita el heap de V8 — si se pasa, muere el proceso, no el VPS
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Deshabilita devtools en el build (no sirven en producción)
ENV NUXT_DEVTOOLS_ENABLED=false

# Fuerza a Rollup a usar el hilo principal — evita saturar cores del VPS
ENV ROLLUP_NATIVE_WORKERS=0

# Usa fuentes locales si ya están cacheadas — evita descargas en build time
ENV NUXT_FONTS_PREFER_LOCAL=true

# nuxt build setea NODE_ENV=production solo — no hay que forzarlo antes
RUN bun run build

# ── Production: imagen final mínima, sin código fuente ni devDeps ────────────
FROM oven/bun:1-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

RUN addgroup --system --gid 1001 nuxt \
 && adduser --system --uid 1001 nuxt

# Solo copiamos el output compilado — el resto no existe en esta imagen
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output

# Reinstala deps del servidor de Nitro desde cero (los node_modules del build están incompletos)
RUN cd .output/server && rm -rf node_modules && bun install && chown -R nuxt:nuxt /app/.output

USER nuxt

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/verifront/ > /dev/null || exit 1

CMD ["bun", ".output/server/index.mjs"]

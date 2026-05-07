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

RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 nuxt

COPY --from=builder /app/.output ./.output
RUN cd .output/server && rm -rf node_modules && bun install && \
    chown -R nuxt:nuxt /app/.output

USER nuxt

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/verifront/ > /dev/null || exit 1

CMD ["bun", ".output/server/index.mjs"]

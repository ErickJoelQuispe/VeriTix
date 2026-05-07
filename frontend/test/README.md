# Tests frontend

Estructura base:

- `test/unit/`: utils y logica pura.
- `test/nuxt/`: componentes, composables y paginas que necesitan runtime Nuxt.
- `test/e2e/`: journeys de alto valor; por ahora queda un placeholder.

Comandos:

- `bun run test`
- `bun run test:unit`
- `bun run test:nuxt`
- `bun run test:e2e`

Ejecutar un solo archivo:

- `bunx vitest run test/nuxt/events-price-chip.nuxt.spec.ts`
- `bunx vitest run test/unit/currency-formatters.test.ts`

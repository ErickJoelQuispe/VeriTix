<script setup lang="ts">
const valuePillars = [
  {
    title: 'Curación clara',
    description: 'Destacamos lo importante para que encuentres eventos rápido, sin ruido visual.',
    accent: '01',
  },
  {
    title: 'Acceso confiable',
    description: 'Una experiencia pensada para que navegar, entrar y volver sea simple y seguro.',
    accent: '02',
  },
  {
    title: 'Experiencia consistente',
    description: 'La misma lógica visual en todo el producto: sobria, limpia y premium.',
    accent: '03',
  },
]

const valueSignals = [
  'Menos ruido, más foco',
  'Navegación confiable',
  'Una sola identidad visual',
]
</script>

<template>
  <section
    id="por-que-veritix"
    class="vtx-section-fade relative isolate overflow-hidden border-y border-default/55 bg-linear-to-b from-default/88 via-elevated/84 to-default/88 py-16 sm:py-20 lg:py-24"
  >
    <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-white/3" aria-hidden="true" />
    <div class="vtx-value-grid" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/16 to-transparent" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

    <BaseContainer>
      <div class="space-y-8 lg:space-y-10">
        <UiSectionHeading
          eyebrow="Principios del producto"
          title="Por qué VeriTix"
          description="Cada decisión visual busca reducir fricción, transmitir confianza y mantener una experiencia coherente de principio a fin."
        />

        <div class="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside class="vtx-value-spotlight">
            <p class="vtx-value-spotlight-label">
              Lo que priorizamos
            </p>

            <h3 class="mt-3 text-2xl font-display leading-tight text-highlighted sm:text-3xl">
              Una experiencia que se siente clara desde el primer toque.
            </h3>

            <p class="mt-4 max-w-xl text-sm leading-relaxed text-toned sm:text-base">
              VeriTix no busca impresionar con ruido: busca que el usuario entienda, confíe y avance sin fricción.
            </p>

            <ul class="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <li v-for="signal in valueSignals" :key="signal" class="vtx-value-signal">
                <BaseIcon name="i-lucide-check" class="size-4 shrink-0 text-lavender" aria-hidden="true" />
                <span>{{ signal }}</span>
              </li>
            </ul>
          </aside>

          <div class="vtx-value-pillars">
            <article
              v-for="pillar in valuePillars"
              :key="pillar.title"
              class="vtx-value-pillar"
            >
              <div class="flex items-start gap-4">
                <p class="vtx-value-pillar-index">
                  {{ pillar.accent }}
                </p>

                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-semibold text-highlighted">
                    {{ pillar.title }}
                  </h3>
                  <p class="mt-2 text-sm leading-relaxed text-toned">
                    {{ pillar.description }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-value-pillar {
  @apply py-5 sm:py-6;
}

.vtx-value-pillars {
  @apply divide-y divide-default/55;
}

.vtx-value-pillar-index {
  @apply inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-lavender/20 bg-lavender/10 font-mono text-xs font-semibold tracking-[0.16em] text-lavender uppercase;
}

.vtx-value-spotlight {
  @apply p-0;
}

.vtx-value-spotlight-label {
  @apply text-xs font-semibold uppercase tracking-[0.18em] text-muted;
}

.vtx-value-signal {
  @apply flex items-center gap-2 rounded-full border border-default/45 bg-default/10 px-3 py-2 text-sm text-toned;
}

.vtx-value-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to bottom, rgb(255 255 255 / 0.03), transparent 20%),
    repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 0.035) 0,
      rgb(255 255 255 / 0.035) 1px,
      transparent 1px,
      transparent 128px
    );
  mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent);
  pointer-events: none;
  opacity: 0.18;
}
</style>

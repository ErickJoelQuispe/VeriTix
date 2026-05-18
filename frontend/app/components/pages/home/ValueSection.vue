<script setup lang="ts">
const valuePillars = [
  {
    title: 'Curación clara',
    description: 'Destacamos lo importante para que encuentres eventos rápido, sin ruido visual.',
  },
  {
    title: 'Acceso confiable',
    description: 'Una experiencia pensada para que navegar, entrar y volver sea simple y seguro.',
  },
  {
    title: 'Experiencia consistente',
    description: 'La misma lógica visual en todo el producto: sobria, limpia y premium.',
  },
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
      <div class="space-y-8">
        <UiSectionHeading
          eyebrow="Principios del producto"
          title="Por qué VeriTix"
          description="Cada decisión visual busca reducir fricción, transmitir confianza y mantener una experiencia coherente de principio a fin."
        />

        <div class="mt-10 grid divide-y divide-default/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          <article
            v-for="(pillar, index) in valuePillars"
            :key="pillar.title"
            class="vtx-value-pillar"
          >
            <p class="vtx-value-pillar-index">
              {{ String(index + 1).padStart(2, '0') }}
            </p>

            <h3 class="mt-3 text-lg font-semibold text-highlighted">
              {{ pillar.title }}
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-toned">
              {{ pillar.description }}
            </p>
          </article>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-value-pillar {
  @apply px-0 py-5 md:px-6 md:py-0;
}

.vtx-value-pillar-index {
  @apply font-mono text-xs font-medium tracking-[0.16em] text-muted uppercase;
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

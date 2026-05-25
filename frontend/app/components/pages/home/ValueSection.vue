<script setup lang="ts">
const orbitPoints = [
  { label: 'Descubrir', icon: 'i-lucide-compass', x: '14%', y: '20%', step: '01' },
  { label: 'Confiar', icon: 'i-lucide-shield-check', x: '82%', y: '24%', step: '02' },
  { label: 'Comprar', icon: 'i-lucide-ticket', x: '76%', y: '76%', step: '03' },
  { label: 'Disfrutar', icon: 'i-lucide-sparkles', x: '18%', y: '74%', step: '04' },
]

const manifesto = [
  {
    title: 'Decisión clara en segundos',
    description: 'La información crítica aparece primero —fecha, lugar, disponibilidad y precio— para comparar y elegir sin esfuerzo.',
    tag: 'Lectura inteligente',
  },
  {
    title: 'Confianza operativa de punta a punta',
    description: 'Cada acción confirma estado en tiempo real: buscar, comprar y validar mantiene al usuario orientado en todo momento.',
    tag: 'Transparencia del flujo',
  },
  {
    title: 'Estética consistente, percepción premium',
    description: 'Un lenguaje visual único en todo el recorrido que refuerza calidad, orden y profesionalismo en cada pantalla.',
    tag: 'Sistema visual',
  },
]
</script>

<template>
  <section
    id="por-que-veritix"
    class="vtx-lab-section relative isolate overflow-hidden py-20 sm:py-24"
  >
    <BaseContainer>
      <div class="space-y-10 lg:space-y-14">
        <UiSectionHeading
          eyebrow="Principios de experiencia"
          title="Por qué VeriTix"
          description="Diseñamos VeriTix para resolver lo esencial con elegancia: descubrir mejor, comprar con confianza y validar sin fricción."
        />

        <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <article class="vtx-orbit-card">
            <p class="vtx-kicker">
              Arquitectura de experiencia
            </p>

            <h3 class="mt-3 text-2xl font-display leading-tight text-highlighted sm:text-3xl">
              Un journey diseñado para guiar con precisión y transmitir control.
            </h3>

            <p class="mt-4 max-w-xl text-sm leading-relaxed text-toned sm:text-base">
              Cada punto del recorrido cumple una función concreta: orientar la decisión, confirmar acciones y sostener confianza durante toda la compra.
            </p>

            <div class="vtx-orbit-stage mt-8">
              <div class="vtx-orbit">
                <div class="vtx-orbit-core">
                  <span class="text-center text-xs font-semibold uppercase tracking-[0.16em] text-lavender">VeriTix
                    Core</span>
                </div>

                <div
                  v-for="point in orbitPoints"
                  :key="point.label"
                  class="vtx-orbit-node"
                  :style="{ left: point.x, top: point.y }"
                >
                  <span class="vtx-orbit-step">{{ point.step }}</span>
                  <span class="vtx-orbit-node-icon">
                    <BaseIcon :name="point.icon" class="size-4" aria-hidden="true" />
                  </span>
                  <span class="vtx-orbit-node-label">{{ point.label }}</span>
                </div>

                <svg class="vtx-orbit-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <circle cx="50" cy="50" r="36" />
                  <circle cx="50" cy="50" r="24" />
                  <path d="M15 50 Q50 18 85 50" />
                  <path d="M15 50 Q50 82 85 50" />
                </svg>
              </div>

              <div class="vtx-orbit-footnote">
                <span class="vtx-orbit-footnote-dot" aria-hidden="true" />
                Menos incertidumbre, más conversión y mejor percepción de marca.
              </div>
            </div>
          </article>

          <div class="vtx-manifesto">
            <article
              v-for="item in manifesto"
              :key="item.title"
              class="vtx-manifesto-card"
            >
              <p class="vtx-chip">
                {{ item.tag }}
              </p>
              <h3 class="mt-4 text-xl font-display text-highlighted">
                {{ item.title }}
              </h3>
              <p class="mt-3 text-sm leading-relaxed text-toned sm:text-base">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-lab-section {
  background: transparent;
}

.vtx-kicker {
  @apply text-xs font-semibold uppercase tracking-[0.2em] text-muted;
}

.vtx-orbit-card {
  @apply relative overflow-hidden p-0;
}

.vtx-orbit-stage {
  @apply relative overflow-hidden p-0;
}

.vtx-orbit {
  @apply relative mx-auto aspect-square w-full max-w-105 rounded-full border border-default/60 bg-elevated/45;
}

.vtx-orbit-core {
  @apply absolute top-1/2 left-1/2 z-20 inline-flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-lavender/40 bg-lavender/15 shadow-[0_0_40px_rgb(167_139_250/0.35)];
}

.vtx-orbit-node {
  @apply absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-default/60 bg-default/65 px-3 py-2 shadow-[0_8px_20px_rgb(0_0_0/0.14)] backdrop-blur-sm transition-all duration-300;
}

.vtx-orbit-node:hover {
  @apply translate-y-[54%] border-lavender/45 bg-elevated/80;
}

.vtx-orbit-step {
  @apply mb-1 block text-[10px] font-semibold tracking-[0.18em] text-muted;
}

.vtx-orbit-node-icon {
  @apply mb-1 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-lavender/35 bg-lavender/15 text-lavender;
}

.vtx-orbit-node-label {
  @apply block text-xs font-medium tracking-wide text-highlighted;
}

.vtx-orbit-lines {
  @apply absolute inset-0 z-10 h-full w-full;
}

.vtx-orbit-lines path,
.vtx-orbit-lines circle {
  fill: none;
  stroke: rgb(167 139 250 / 0.35);
  stroke-width: 0.35;
  stroke-dasharray: 2.4 2.4;
}

.vtx-orbit-footnote {
  @apply mt-5 flex items-center gap-2 text-xs text-toned;
}

.vtx-orbit-footnote-dot {
  @apply size-2 rounded-full bg-lavender;
}

.vtx-manifesto {
  @apply grid gap-0;
}

.vtx-manifesto-card {
  @apply relative overflow-hidden border-b border-default/55 py-6 transition-all duration-300 sm:py-7;
}

.vtx-manifesto-card:hover {
  @apply border-lavender/35;
}

.vtx-chip {
  @apply inline-flex rounded-full border border-lavender/35 bg-lavender/12 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-lavender uppercase;
}
</style>

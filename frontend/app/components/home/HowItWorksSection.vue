<script setup lang="ts">
const steps = [
  {
    id: 1,
    title: 'Sintoniza',
    description: 'Abrí el portal con artista, ciudad o género y activá una primera lectura del cartel en segundos.',
    cue: 'Entrada',
    motif: 'Prisma de búsqueda',
    toneClass: 'vtx-flow-node--nebula',
  },
  {
    id: 2,
    title: 'Traza',
    description: 'Navegá por geometría de géneros, alterná filtros y ordená el mapa según tu ruta sonora.',
    cue: 'Navegación',
    motif: 'Reticula fractal',
    toneClass: 'vtx-flow-node--auric',
  },
  {
    id: 3,
    title: 'Reserva',
    description: 'Confirmá tu entrada con contexto claro de precio y disponibilidad para cerrar el ritual sin fricción.',
    cue: 'Cierre',
    motif: 'Sello escarlata',
    toneClass: 'vtx-flow-node--crimson',
  },
] as const
</script>

<template>
  <UiSectionContainer id="como-funciona">
    <UiSectionHeading
      eyebrow="Flujo ritual"
      title="Del hallazgo al escenario"
      description="Un recorrido rediseñado para mantener orientación, contraste y velocidad en cada paso."
      :center="true"
    />

    <div class="vtx-flow-grid mt-8 grid gap-5 lg:grid-cols-3">
      <article
        v-for="step in steps"
        :key="step.id"
        class="vtx-flow-node"
        :class="step.toneClass"
      >
        <div class="space-y-3">
          <UiMetaLabel>
            {{ step.cue }}
          </UiMetaLabel>

          <div class="flex items-center justify-between gap-3">
            <span class="vtx-flow-index">
              0{{ step.id }}
            </span>
          </div>

          <h3 class="font-display text-4xl leading-none text-highlighted">
            {{ step.title }}
          </h3>

          <p class="text-sm leading-relaxed text-toned md:text-base">
            {{ step.description }}
          </p>

          <div class="vtx-flow-runes">
            <UiMetaLabel as="span">
              {{ step.motif }}
            </UiMetaLabel>
            <UIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </article>
    </div>
  </UiSectionContainer>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-flow-grid {
  @apply relative;
}

.vtx-flow-grid::before {
  @apply absolute left-0 right-0 top-1/2 h-px pointer-events-none -translate-y-1/2;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(44 189 230 / 0),
    rgb(44 189 230 / 0.42),
    rgb(239 170 71 / 0.44),
    rgb(240 100 127 / 0.42),
    rgb(44 189 230 / 0)
  );
}

.vtx-flow-node {
  @apply relative overflow-hidden rounded-[1.1rem] p-[1.1rem];
  border: 1px solid rgb(145 161 190 / 0.34);
  background:
    linear-gradient(170deg, rgb(255 255 255 / 0.1), rgb(255 255 255 / 0.02)),
    linear-gradient(145deg, rgb(12 17 30 / 0.85), rgb(16 23 38 / 0.9));
  box-shadow:
    0 22px 36px -32px rgb(0 0 0 / 0.82),
    inset 0 0 0 1px rgb(255 255 255 / 0.04);
}

.vtx-flow-node::before {
  @apply absolute inset-0 pointer-events-none;
  content: '';
  background: repeating-conic-gradient(
    from 14deg at 84% 18%,
    rgb(255 255 255 / 0.06) 0deg,
    rgb(255 255 255 / 0) 16deg,
    rgb(255 255 255 / 0.03) 26deg,
    rgb(255 255 255 / 0) 40deg
  );
  opacity: 0.66;
}

.vtx-flow-node--nebula::after,
.vtx-flow-node--auric::after,
.vtx-flow-node--crimson::after {
  @apply absolute -top-[35%] -right-[18%] h-44 w-44 rounded-full pointer-events-none;
  content: '';
}

.vtx-flow-node--nebula::after {
  background: radial-gradient(circle at 50% 50%, rgb(44 189 230 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-node--auric::after {
  background: radial-gradient(circle at 50% 50%, rgb(239 170 71 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-node--crimson::after {
  background: radial-gradient(circle at 50% 50%, rgb(240 100 127 / 0.28), rgb(255 255 255 / 0));
}

.vtx-flow-index {
  @apply relative z-10 inline-flex items-center justify-center min-w-[2.15rem] h-[2.15rem] rounded-full text-[0.72rem] font-bold tracking-wide;
  border: 1px solid rgb(145 161 190 / 0.74);
  background: rgb(17 24 39 / 0.72);
  color: rgb(221 227 240 / 0.95);
}

.vtx-flow-runes {
  @apply relative z-10 inline-flex items-center gap-[0.45rem] mt-[0.55rem] px-2 py-[0.35rem] rounded-full;
  border: 1px solid rgb(145 161 190 / 0.32);
  background: rgb(255 255 255 / 0.03);
}

@media (max-width: 1023px) {
  .vtx-flow-grid::before {
    @apply hidden;
  }
}
</style>

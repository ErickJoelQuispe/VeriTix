<script setup lang="ts">
const { query, results, pending } = useEventSearch()
const { scrollToSection } = useSectionScroll()

function onSearch() {
  scrollToSection('eventos')
}
</script>

<template>
  <UiSectionContainer id="hero">
    <div class="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="pointer-events-none absolute -left-6 top-6 hidden h-24 w-24 rotate-45 border border-secondary/35 lg:block" />

      <div class="space-y-8 animate-hero-reveal">
        <h1 class="font-display text-5xl leading-[0.94] text-highlighted md:text-6xl lg:text-7xl">
          Veritix
          <span class="vtx-prismatic-text mt-2 block text-3xl md:text-4xl lg:text-5xl">
            Atlas de conciertos visionarios
          </span>
        </h1>

        <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
          Explorá el universo de conciertos visionarios con VeriTix, tu atlas definitivo para descubrir eventos en vivo que desafían lo convencional.
        </p>
        <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
          Desde artistas emergentes hasta leyendas del escenario, encontrá tu próximo ritual musical con nuestro buscador intuitivo y sumergite en experiencias sonoras únicas.
        </p>

        <form class="space-y-3" @submit.prevent="onSearch">
          <!-- Search Field Container -->
          <div
            class="flex items-center gap-2 rounded-full border border-default/50 bg-linear-to-br from-white/10 to-white/5 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-200 focus-within:border-primary/45 focus-within:bg-white/8 focus-within:shadow-[0_16px_34px_-24px_rgba(239,170,71,0.28)]"
          >
            <!-- Search Icon -->
            <UIcon
              name="i-lucide-search"
              class="ml-3 h-5 w-5 shrink-0 text-toned transition-colors duration-300"
              :class="{ 'text-primary': query.length > 0 }"
              aria-hidden="true"
            />

            <!-- Input using Nuxt UI UInput -->
            <UInput
              v-model="query"
              placeholder="Buscá artista, ciudad o género..."
              color="neutral"
              variant="none"
              size="lg"
              aria-label="Buscar eventos"
              class="flex-1 border-0 bg-transparent text-base text-highlighted focus:ring-0"
              :ui="{
                base: 'border-0! bg-transparent! shadow-none! ring-0! hover:bg-transparent! focus:bg-transparent! focus-visible:bg-transparent! placeholder:text-toned/80',
              }"
            />

            <!-- Submit Button - Subtle outline variant -->
            <BaseButton
              kind="primary"
              type="submit"
              size="md"
              class="shrink-0 px-6"
            >
              Buscar
            </BaseButton>
          </div>

          <!-- Hint Text -->
          <p class="flex items-center gap-2 px-4 text-xs text-toned/90">
            <UIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Descubrí conciertos progresivos y eventos únicos</span>
          </p>
        </form>

        <div class="flex flex-wrap items-center gap-3">
          <p class="text-sm text-toned">
            {{ pending ? 'Actualizando cartel...' : `Eventos visibles: ${results.length}` }}
          </p>

          <BaseButton
            kind="secondary"
            to="#generos"
            size="sm"
            class="px-4"
          >
            Explorar géneros
          </BaseButton>
        </div>
      </div>

      <div class="animate-hero-reveal">
        <HomePsychedelicOrb />
      </div>
    </div>
  </UiSectionContainer>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.animate-hero-reveal {
  animation: hero-reveal 920ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-hero-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-reveal {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

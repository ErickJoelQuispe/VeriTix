<script setup lang="ts">
const { query, results, pending } = useEventSearch()
const { scrollToSection } = useSectionScroll()

function onSearch() {
  scrollToSection('eventos')
}
</script>

<template>
  <section
    id="hero"
    class="vtx-section-fade relative scroll-mt-36 py-14 sm:scroll-mt-40 sm:py-16 lg:scroll-mt-44 lg:py-24"
  >
    <BaseContainer>
      <div class="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
        <div class="space-y-8 animate-hero-reveal">
          <h1 class="space-y-3 font-display text-6xl leading-[0.9] text-highlighted md:text-7xl lg:text-8xl">
            <span class="relative inline-block">
              <svg class="vtx-hero-diamond absolute -left-17 top-1/2 hidden h-20 w-20 -translate-y-1/2 opacity-96 md:-left-20 md:h-22 md:w-22 lg:block" viewBox="0 0 64 64" aria-hidden="true">
                <defs>
                  <linearGradient id="vtx-hero-diamond-fill" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="color-mix(in oklch, var(--color-lavender) 70%, white)" />
                    <stop offset="64%" stop-color="var(--color-accent)" />
                    <stop offset="100%" stop-color="color-mix(in oklch, var(--color-info) 56%, white)" />
                  </linearGradient>
                  <linearGradient id="vtx-hero-diamond-face" x1="18" y1="12" x2="46" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="rgb(255 255 255 / 0.9)" />
                    <stop offset="100%" stop-color="rgb(255 255 255 / 0.1)" />
                  </linearGradient>
                </defs>

                <path
                  d="M24 8 53 24 45 54 24 58 11 24Z"
                  fill="url(#vtx-hero-diamond-fill)"
                  stroke="rgb(255 255 255 / 0.1)"
                  stroke-width="0.8"
                  stroke-linejoin="round"
                />
                <path d="M24 13 39 24 34 45 24 50 16 24Z" fill="url(#vtx-hero-diamond-face)" opacity="0.58" />
                <path d="M24 13 32 24 24 35 16 24Z" fill="rgb(255 255 255 / 0.62)" opacity="0.42" />
                <path d="M16 24 24 35 17 46 12 39Z" fill="color-mix(in oklch, var(--color-lavender) 20%, transparent)" opacity="0.36" />
                <path d="M39 24 32 24 24 35 34 45Z" fill="rgb(255 255 255 / 0.08)" opacity="0.3" />
              </svg>
              <span class="relative">Veritix</span>
            </span>
            <span class="vtx-prismatic-text block text-4xl md:text-5xl lg:text-6xl">
              The Pure Experience
            </span>
          </h1>

          <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
            The pristine way to discover, filter, and book live events.
          </p>

          <form class="space-y-3" @submit.prevent="onSearch">
            <FormInput
              v-model="query"
              placeholder="Buscá artista, ciudad o género..."
              variant="hero"
              size="xl"
              aria-label="Buscar eventos"
              class="w-full text-base"
            >
              <template #leading>
                <BaseIcon
                  name="i-lucide-search"
                  class="size-5 transition-colors duration-300"
                  :class="query.length > 0 ? 'text-primary' : 'text-toned'"
                  aria-hidden="true"
                />
              </template>

              <template #trailing>
                <BaseButton
                  variant="primary"
                  type="submit"
                  size="md"
                  class="rounded-full! px-6! py-2.5!"
                >
                  Buscar
                </BaseButton>
              </template>
            </FormInput>

            <!-- Hint Text -->
            <p class="flex items-center gap-2 px-4 text-xs text-toned/90">
              <BaseIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Descubrí conciertos progresivos y eventos únicos</span>
            </p>
          </form>

          <div class="flex flex-wrap items-center gap-3">
            <p class="text-sm text-toned">
              {{ pending ? 'Actualizando cartel...' : `Eventos visibles: ${results.length}` }}
            </p>

            <BaseButton
              variant="secondary"
              to="#generos"
              size="sm"
              class="px-4"
            >
              Explorar géneros
            </BaseButton>
          </div>
        </div>

        <div class="animate-hero-reveal">
          <PagesHomeCrystalPrism />
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-section-fade {
  animation: section-fade-in 700ms ease-out both;
}

.vtx-prismatic-text {
  background-image: linear-gradient(135deg, var(--color-primary), var(--color-error), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.vtx-hero-diamond {
  filter: drop-shadow(0 0 12px color-mix(in oklch, var(--color-lavender) 10%, transparent));
}

.animate-hero-reveal {
  animation: hero-reveal 920ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-section-fade,
  .animate-hero-reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

@keyframes section-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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

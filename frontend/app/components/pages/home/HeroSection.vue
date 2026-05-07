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
        <div class="pointer-events-none absolute -left-6 top-6 hidden h-24 w-24 rotate-45 border border-secondary/35 lg:block" />

        <div class="space-y-8 animate-hero-reveal">
          <h1 class="font-display text-6xl leading-[0.9] text-highlighted md:text-7xl lg:text-8xl">
            Veritix
            <span class="vtx-prismatic-text mt-2 block text-4xl md:text-5xl lg:text-6xl">
              The Pure Experience
            </span>
          </h1>

          <p class="max-w-2xl text-base leading-relaxed text-toned md:text-lg">
            The pristine way to discover, filter, and book live events with a single visual language.
          </p>

          <div class="flex flex-wrap gap-2.5">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-default/70 bg-elevated/45 px-3 py-1.5 text-[0.68rem] tracking-[0.11em] text-muted uppercase">
              <strong class="text-highlighted">Live</strong> catalog
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-default/70 bg-elevated/45 px-3 py-1.5 text-[0.68rem] tracking-[0.11em] text-muted uppercase">
              <strong class="text-highlighted">Synced</strong> filters
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-default/70 bg-elevated/45 px-3 py-1.5 text-[0.68rem] tracking-[0.11em] text-muted uppercase">
              <strong class="text-highlighted">Secure</strong> session
            </span>
          </div>

          <form class="space-y-3" @submit.prevent="onSearch">
            <!-- Search Field Container -->
            <div
              class="flex items-center gap-2 rounded-full border border-default/50 bg-linear-to-br from-white/10 to-white/5 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-200 focus-within:border-primary/45 focus-within:bg-white/8 focus-within:shadow-[0_16px_34px_-24px_rgba(239,170,71,0.28)]"
            >
              <!-- Search Icon -->
              <BaseIcon
                name="i-lucide-search"
                class="ml-3 h-5 w-5 shrink-0 text-toned transition-colors duration-300"
                :class="{ 'text-primary': query.length > 0 }"
                aria-hidden="true"
              />

              <FormInput
                v-model="query"
                placeholder="Buscá artista, ciudad o género..."
                variant="none"
                aria-label="Buscar eventos"
                class="flex-1 border-0 bg-transparent text-base text-highlighted focus:ring-0"
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
              <BaseIcon name="i-lucide-sparkles" class="h-3.5 w-3.5 text-primary" aria-hidden="true" />
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
          <PagesHomePsychedelicOrb />
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

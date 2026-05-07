<script setup lang="ts">
const { results, pending } = useEventSearch()

const featuredEvents = computed(() => {
  return results.value.slice(0, 6)
})
</script>

<template>
  <section
    id="eventos"
    class="vtx-section-fade relative scroll-mt-36 py-14 sm:scroll-mt-40 sm:py-16 lg:scroll-mt-44 lg:py-24"
  >
    <BaseContainer>
      <UiSectionHeading
        eyebrow="Curated access"
        title="Curated Transmissions"
        action-label="Ver eventos"
        action-to="/events"
      />

      <div
        v-if="pending"
        class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="i in 3" :key="`skeleton-${i}`" class="space-y-4">
          <BaseSkeleton class="h-96 rounded-sm" />
          <BaseSkeleton class="h-4 w-28" />
          <BaseSkeleton class="h-8 w-4/5" />
          <BaseSkeleton class="h-4 w-3/5" />
        </div>
      </div>

      <template v-else>
        <div v-if="featuredEvents.length" class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <UiTransmissionCard
            v-for="(event, index) in featuredEvents"
            :key="event.id"
            :event="event"
            :index="index"
          />
        </div>

        <p
          v-if="!featuredEvents.length"
          class="mt-8 rounded-2xl border border-default/75 bg-elevated/50 px-6 py-8 text-center text-sm text-muted"
        >
          No encontramos conciertos para tu búsqueda actual.
        </p>
      </template>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-section-fade {
  animation: section-fade-in 700ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-section-fade {
    @apply opacity-100;
    animation: none;
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
</style>

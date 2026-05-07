<script setup lang="ts">
const { results, pending } = useEventSearch()

const featuredEvents = computed(() => {
  return results.value.slice(0, 6)
})
</script>

<template>
  <UiSectionContainer id="eventos">
    <UiSectionHeading
      eyebrow="Cartel"
      title="Eventos destacados"
      description="Una selección viva del catálogo real. Misma lectura visual que en /events, pero más editorial para descubrir rápido qué merece tu atención."
    />

    <div
      v-if="pending"
      class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
    >
      <USkeleton
        v-for="i in 3"
        :key="`skeleton-${i}`"
        class="h-105 rounded-2xl"
      />
    </div>

    <template v-else>
      <div class="mt-8 md:hidden">
        <EventsCarousel :events="featuredEvents" />
      </div>

      <div class="mt-8 hidden grid-cols-2 gap-6 md:grid lg:grid-cols-3">
        <EventsListingCard
          v-for="event in featuredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <div v-if="featuredEvents.length" class="mt-6 flex justify-end">
        <BaseButton
          kind="tertiary"
          to="/events"
          size="sm"
          trailing-icon="i-lucide-arrow-right"
          class="border border-default/55 bg-default/6 px-4"
        >
          Ver cartel completo
        </BaseButton>
      </div>

      <p
        v-if="!featuredEvents.length"
        class="mt-8 rounded-2xl border border-default/75 bg-muted/50 px-6 py-8 text-center text-sm text-muted"
      >
        No encontramos conciertos para tu búsqueda actual.
      </p>
    </template>
  </UiSectionContainer>
</template>

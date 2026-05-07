<script setup lang="ts">
const { results, pending } = useEventSearch()

const featuredEvents = computed(() => {
  return results.value.slice(0, 6)
})
</script>

<template>
  <UiSectionContainer id="eventos">
    <UiSectionHeading
      eyebrow="Curated access"
      title="Curated Transmissions"
      description="Una lectura editorial del catálogo real, con imagen arriba e información clara debajo para descubrir rápido qué merece tu atención."
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
        class="mt-8 rounded-2xl border border-default/75 bg-elevated/50 px-6 py-8 text-center text-sm text-muted"
      >
        No encontramos conciertos para tu búsqueda actual.
      </p>
    </template>
  </UiSectionContainer>
</template>

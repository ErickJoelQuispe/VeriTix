<script setup lang="ts">
import type { EventCatalogItem } from '~/types'

defineProps<{
  events: EventCatalogItem[]
}>()
</script>

<template>
  <div v-if="events.length">
    <BaseCarousel
      :items="events"
      arrows
      dots
      class="-ms-4"
      :ui="{
        item: 'basis-[86%] ps-4 sm:basis-[48%]',
      }"
    >
      <template #default="{ item }">
        <EventsListingCard :event="item" />
      </template>
    </BaseCarousel>
  </div>

  <p
    v-else
    class="rounded-2xl border border-default/75 bg-elevated/50 px-6 py-8 text-center text-sm text-muted"
  >
    No hay conciertos para esos filtros.
  </p>
</template>

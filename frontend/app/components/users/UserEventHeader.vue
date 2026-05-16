<script setup lang="ts">
import type { EnrichedEvent } from '~~/shared/types'

defineProps<{
  event: EnrichedEvent
}>()

const formattedDate = (eventDate: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(eventDate))
</script>

<template>
  <UiPanel variant="glass" radius="xl" padding="none" class="overflow-hidden">
    <!-- Banner image -->
    <div class="relative h-48">
      <NuxtImg
        v-if="event.imageUrl"
        :src="event.imageUrl"
        :alt="`Imagen de ${event.name}`"
        class="h-full w-full object-cover"
        loading="eager"
        width="1200"
        height="400"
      />

      <div
        v-else
        class="h-full w-full bg-linear-to-br from-primary/20 to-accent/10"
      />

      <!-- Dark overlay with bottom gradient -->
      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"
      />
    </div>

    <!-- Event info -->
    <div class="space-y-3 p-5 sm:p-6">
      <UiMetaLabel>
        Mi evento
      </UiMetaLabel>

      <h1 class="text-2xl font-bold leading-tight text-highlighted sm:text-3xl">
        {{ event.name }}
      </h1>

      <div class="flex flex-col gap-2 text-sm text-toned sm:flex-row sm:items-center sm:gap-4">
        <span class="flex items-center gap-1.5">
          <BaseIcon name="i-lucide-calendar" class="size-4 shrink-0 text-muted" />
          {{ formattedDate(event.eventDate) }}
        </span>

        <span class="flex items-center gap-1.5">
          <BaseIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-muted" />
          {{ event.venue.name }} · {{ event.venue.city }}
        </span>
      </div>

      <div v-if="event.format" class="pt-1">
        <BaseBadge kind="tag" size="sm">
          {{ event.format.name }}
        </BaseBadge>
      </div>
    </div>
  </UiPanel>
</template>

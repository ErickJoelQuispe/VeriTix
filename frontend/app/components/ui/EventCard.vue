<script setup lang="ts">
import type { EventCatalogItem } from '~~/shared/types'
import { formatEventDate } from '@/utils/date-formatters'

const props = defineProps<{
  event: EventCatalogItem
}>()

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
})
</script>

<template>
  <UiPanel as="article" interactive radius="md" padding="none" class="group flex h-full flex-col overflow-hidden">
    <div data-test="event-card-media" class="relative w-full overflow-hidden border-b border-white/10 transition-colors duration-200 group-hover:border-lavender/35 group-focus-within:border-lavender/35">
      <NuxtImg
        :src="event.imageUrl ?? undefined"
        :alt="`Imagen de ${event.name}`"
        class="h-60 w-full object-cover transition duration-500 sm:h-64"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90 group-focus-within:opacity-90" />
    </div>

    <div data-test="event-card-content" class="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5">
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-default/60 bg-default/40 px-2 py-1 text-xs font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/60 group-focus-within:border-default/80 group-focus-within:bg-default/60">
          <BaseIcon name="i-lucide-map-pin" class="size-3.5 text-primary/70" />
          <span class="leading-none">{{ event.venue.city }}</span>
        </span>

        <span v-if="event.format" class="inline-flex items-center gap-1.5 rounded-full border border-default/60 bg-default/40 px-2 py-1 text-xs font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/60 group-focus-within:border-default/80 group-focus-within:bg-default/60">
          <BaseIcon name="i-lucide-ticket" class="size-3.5 text-primary/70" />
          <span class="leading-none truncate">{{ event.format.name }}</span>
        </span>
      </div>

      <h3 class="line-clamp-2 text-base font-semibold leading-tight text-highlighted transition-colors duration-300 group-hover:text-white sm:text-lg">
        {{ event.name }}
      </h3>

      <div data-test="event-card-footer" class="mt-auto flex flex-col gap-3 border-t border-white/10 pt-4 transition-colors duration-200 group-hover:border-lavender/35 group-focus-within:border-lavender/35 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <span class="block text-xs tracking-widest text-muted uppercase">{{ eventDate }}</span>
        </div>

        <div class="shrink-0 sm:ml-auto">
          <BaseButton
            :to="`/events/${event.id}`"
            variant="primary"
            size="sm"
            class="w-full px-3.5 sm:w-auto"
          >
            Reservar
          </BaseButton>
        </div>
      </div>
    </div>
  </UiPanel>
</template>

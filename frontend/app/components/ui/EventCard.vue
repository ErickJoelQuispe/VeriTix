<script setup lang="ts">
import type { EventCatalogItem } from '~/types'
import { formatEventDate } from '~/utils/date-formatters'

const props = defineProps<{
  event: EventCatalogItem
}>()

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
})

const eventTime = computed(() => {
  return new Date(props.event.dateISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

const cardPrice = computed(() => {
  return `Price · ${props.event.currency}`
})
</script>

<template>
  <UiGlassPanel as="article" interactive radius="md" class="group flex h-full flex-col overflow-hidden">
    <div class="relative overflow-hidden rounded-xl border border-white/10 transition-colors duration-200 group-hover:border-default/55 group-focus-within:border-default/55">
      <NuxtImg
        :src="event.imageUrl ?? undefined"
        :alt="`Imagen de ${event.name}`"
        class="h-36 w-full object-cover transition duration-500"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90 group-focus-within:opacity-90" />
    </div>

    <div class="flex flex-1 flex-col pt-3 sm:px-1">
      <div class="flex min-h-8 flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-default/60 bg-default/40 px-2 py-1 text-xs font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/60 group-focus-within:border-default/80 group-focus-within:bg-default/60">
          <BaseIcon name="i-lucide-map-pin" class="size-3.5 text-primary/70" />
          <span class="leading-none">{{ event.venue.city }}</span>
        </span>

        <span v-if="event.format" class="inline-flex items-center gap-1.5 rounded-full border border-default/60 bg-default/40 px-2 py-1 text-xs font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/60 group-focus-within:border-default/80 group-focus-within:bg-default/60">
          <BaseIcon name="i-lucide-ticket" class="size-3.5 text-primary/70" />
          <span class="leading-none truncate">{{ event.format.name }}</span>
        </span>
      </div>

      <div class="mt-3 min-h-20 space-y-2">
        <div class="flex items-center justify-between text-[0.68rem] tracking-[0.11em] text-muted uppercase">
          <span>{{ eventDate }}</span>
          <span class="truncate">{{ event.venue.name }}</span>
        </div>

        <h3 class="line-clamp-2 text-base font-semibold leading-tight text-highlighted transition-colors duration-300 group-hover:text-white sm:text-lg">
          {{ event.name }}
        </h3>

        <p class="line-clamp-1 text-sm font-medium text-toned/90 sm:text-base">
          Curated transmission from the live catalog.
        </p>
      </div>

      <div class="mt-auto border-t border-white/10 pt-3 transition-colors duration-200 group-hover:border-default/55 group-focus-within:border-default/55">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs tracking-[0.1em] text-muted uppercase">{{ eventTime }}</span>
          <span class="text-sm font-medium text-highlighted">{{ cardPrice }}</span>
          <BaseButton
            :to="`/events/${event.id}`"
            variant="primary"
            size="sm"
            class="shrink-0 px-3.5"
          >
            Reservar
          </BaseButton>
        </div>
      </div>
    </div>
  </UiGlassPanel>
</template>

<script setup lang="ts">
import type { EventCatalogItem } from '~/types'
import { formatEventDate } from '~/utils/date-formatters'

const props = defineProps<{
  event: EventCatalogItem
}>()

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
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
          <UIcon name="i-lucide-map-pin" class="size-3.5 text-primary/70" />
          <span class="leading-none">{{ event.venue.city }}</span>
        </span>

        <span v-if="event.format" class="inline-flex items-center gap-1.5 rounded-full border border-default/60 bg-default/40 px-2 py-1 text-xs font-medium text-toned transition-colors duration-200 group-hover:border-default/80 group-hover:bg-default/60 group-focus-within:border-default/80 group-focus-within:bg-default/60">
          <UIcon name="i-lucide-ticket" class="size-3.5 text-primary/70" />
          <span class="leading-none truncate">{{ event.format.name }}</span>
        </span>
      </div>

      <div class="mt-3 min-h-20 space-y-2">
        <h3 class="line-clamp-2 text-base font-semibold leading-tight text-highlighted transition-colors duration-300 group-hover:text-white sm:text-lg">
          {{ event.name }}
        </h3>

        <p class="line-clamp-1 text-sm font-medium text-toned/90 sm:text-base">
          {{ event.venue.name }}
        </p>
      </div>

      <div class="mt-auto border-t border-white/10 pt-3 transition-colors duration-200 group-hover:border-default/55 group-focus-within:border-default/55">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0 flex-1 space-y-1">
            <UiMetaLabel>
              Fecha
            </UiMetaLabel>
            <p class="flex min-w-0 items-center gap-2 text-sm font-medium text-muted/90 transition-colors duration-200 group-hover:text-toned group-focus-within:text-toned">
              <UIcon name="i-lucide-calendar-days" class="size-3.5 text-secondary/80 transition-colors duration-200 group-hover:text-primary/80 group-focus-within:text-primary/80" />
              <span class="min-w-0 truncate">{{ eventDate }}</span>
            </p>
          </div>

          <BaseButton
            :to="`/events/${event.id}`"
            kind="primary"
            size="sm"
            class="shrink-0 self-start px-3.5 sm:self-auto"
          >
            Reservar
          </BaseButton>
        </div>
      </div>
    </div>
  </UiGlassPanel>
</template>

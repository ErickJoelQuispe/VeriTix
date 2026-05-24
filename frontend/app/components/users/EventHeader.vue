<script setup lang="ts">
import type { EnrichedEvent } from '~~/shared/types'

defineProps<{
  event: EnrichedEvent
}>()

function formattedDate(eventDate: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(eventDate))
}
</script>

<template>
  <section class="space-y-8 lg:space-y-10">
    <header class="space-y-5 lg:space-y-6">
      <div class="space-y-3">
        <h1 class="max-w-4xl text-2xl font-bold leading-tight text-highlighted sm:text-3xl lg:text-4xl">
          {{ event.name }}
        </h1>

        <div class="flex flex-col gap-2 text-sm text-toned sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
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
    </header>

    <div class="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div class="relative aspect-square w-full max-w-[280px] self-center overflow-hidden rounded-3xl bg-elevated/35 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.7)] sm:max-w-[340px] md:max-w-[420px] lg:max-w-none lg:self-start">
        <NuxtImg
          v-if="event.imageUrl"
          :src="event.imageUrl"
          :alt="`Imagen de ${event.name}`"
          class="h-full w-full object-cover"
          loading="eager"
          width="800"
          height="800"
        />

        <div
          v-else
          class="h-full w-full bg-linear-to-br from-primary/20 to-accent/10"
        />
      </div>

      <div class="min-w-0 lg:pt-1">
        <slot />
      </div>
    </div>
  </section>
</template>

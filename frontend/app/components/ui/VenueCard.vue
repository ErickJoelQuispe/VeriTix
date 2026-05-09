<script setup lang="ts">
import type { PublicVenueListApiItem } from '~~/shared/api/public-venues'

const props = defineProps<{
  venue: PublicVenueListApiItem
}>()

const venueTypeLabels: Record<string, string> = {
  ESTADIO: 'Estadio',
  ARENA: 'Arena',
  FORO: 'Foro',
  AUDITORIO: 'Auditorio',
  CLUB: 'Club',
  TEATRO: 'Teatro',
  AL_AIRE_LIBRE: 'Al aire libre',
  OTRO: 'Otro',
}

const featuredLabel = computed(() => {
  return [props.venue.city, props.venue.country].filter(Boolean).join(', ')
})

const venueTypeLabel = computed(() => venueTypeLabels[props.venue.type] ?? props.venue.type)
</script>

<template>
  <UiPanel as="article" interactive radius="xl" padding="none" class="group flex h-full flex-col overflow-hidden">
    <div class="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-elevated/30">
      <NuxtImg
        v-if="venue.imageUrl"
        :src="venue.imageUrl"
        :alt="`Imagen de ${venue.name}`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div
        v-else
        class="flex h-full items-center justify-center bg-linear-to-br from-secondary/18 via-elevated/35 to-primary/18"
      >
        <BaseIcon name="i-lucide-building-2" class="size-12 text-highlighted/80" />
      </div>

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/72 via-black/10 to-transparent" />

      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <BaseBadge kind="status" size="sm" :color="venue.isActive ? 'success' : 'neutral'">
          {{ venue.isActive ? 'Activo' : 'Inactivo' }}
        </BaseBadge>

        <BaseBadge kind="tag" size="sm">
          {{ venueTypeLabel }}
        </BaseBadge>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5 sm:p-6">
      <div class="space-y-2">
        <h3 class="text-lg font-semibold leading-tight text-highlighted">
          {{ venue.name }}
        </h3>

        <p class="text-sm leading-relaxed text-toned">
          {{ venue.address }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <BaseBadge kind="tag" size="sm">
          {{ featuredLabel }}
        </BaseBadge>
        <BaseBadge v-if="venue.capacity" kind="info" size="sm">
          {{ venue.capacity.toLocaleString('es-ES') }} personas
        </BaseBadge>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p class="text-xs leading-relaxed text-muted">
          {{ venue.state ? venue.state : 'Sin estado/provincia' }}
        </p>

        <div class="flex items-center gap-2">
          <BaseButton
            :to="`/venues/${venue.id}`"
            variant="secondary"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
          >
            Ver venue
          </BaseButton>

          <BaseButton
            v-if="venue.website"
            :href="venue.website"
            variant="outlined"
            size="sm"
            target="_blank"
            rel="noreferrer"
            trailing-icon="i-lucide-arrow-up-right"
          >
            Web
          </BaseButton>
        </div>
      </div>
    </div>
  </UiPanel>
</template>

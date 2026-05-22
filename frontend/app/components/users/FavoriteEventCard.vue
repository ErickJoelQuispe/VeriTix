<script setup lang="ts">
import type { FavoriteItem } from '~~/shared/types'

const props = defineProps<{
  item: FavoriteItem
  favoriteLoading?: boolean
  isFavorited?: boolean
}>()

const emit = defineEmits<{
  toggleFavorite: []
  viewDetail: []
}>()

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(props.item.event.eventDate))
})

const savedDate = computed(() => {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(new Date(props.item.createdAt))
})

const isFavorite = computed(() => props.isFavorited !== false)
</script>

<template>
  <UiPanel as="article" variant="glass" radius="xl" padding="none" class="group flex h-full flex-col overflow-hidden">
    <div class="relative overflow-hidden border-b border-white/10">
      <NuxtImg
        v-if="props.item.event.imageUrl"
        :src="props.item.event.imageUrl"
        :alt="`Imagen de ${props.item.event.name}`"
        class="h-52 w-full object-cover transition duration-300"
        loading="lazy"
        width="900"
        height="600"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div
        v-else
        class="flex h-52 items-center justify-center bg-linear-to-br from-elevated/40 via-elevated/25 to-elevated/40"
      >
        <BaseIcon name="i-lucide-image" class="size-12 text-muted/50" />
      </div>

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />

      <div class="absolute left-3 top-3">
        <BaseBadge kind="status" size="sm" color="success">
          Favorito
        </BaseBadge>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5 sm:p-6">
      <div class="space-y-1.5">
        <h3 class="line-clamp-2 text-base font-semibold leading-tight text-highlighted sm:text-lg">
          {{ props.item.event.name }}
        </h3>

        <p class="text-sm leading-relaxed text-toned">
          {{ formattedDate }} · {{ props.item.event.venue.name }}
        </p>

        <p v-if="props.item.event.format" class="text-xs text-muted">
          {{ props.item.event.format.name }}
        </p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-default/30 px-3 py-2 text-xs text-toned">
        Guardado el {{ savedDate }}
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <BaseButton
          variant="outlined"
          size="xs"
          :loading="props.favoriteLoading"
          :leading-icon="isFavorite ? 'i-lucide-heart-off' : 'i-lucide-heart'"
          :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          @click.stop="emit('toggleFavorite')"
        >
          {{ isFavorite ? 'Quitar' : 'Guardar' }}
        </BaseButton>

        <BaseButton
          variant="secondary"
          size="sm"
          trailing-icon="i-lucide-arrow-right"
          @click.stop="emit('viewDetail')"
        >
          Ver detalles
        </BaseButton>
      </div>
    </div>
  </UiPanel>
</template>

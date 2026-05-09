<script setup lang="ts">
import type { PublicArtistListApiItem } from '~~/shared/api/public-artists'

const props = defineProps<{
  artist: PublicArtistListApiItem
}>()

const WHITESPACE_REGEX = /\s+/

const artistInitials = computed(() => {
  return props.artist.name
    .split(WHITESPACE_REGEX)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || 'A'
})

const featuredGenres = computed(() => props.artist.genres.slice(0, 3))
</script>

<template>
  <UiPanel as="article" interactive radius="xl" padding="none" class="group flex h-full flex-col overflow-hidden">
    <div class="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-elevated/30">
      <NuxtImg
        v-if="artist.imageUrl"
        :src="artist.imageUrl"
        :alt="`Imagen de ${artist.name}`"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        width="900"
        height="1200"
        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        placeholder
      />

      <div
        v-else
        class="flex h-full items-center justify-center bg-linear-to-br from-lavender/18 via-elevated/35 to-accent/18"
      >
        <BaseAvatar :text="artistInitials" size="xl" class="!size-16 border border-white/10" />
      </div>

      <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />

      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <BaseBadge kind="status" size="sm" :color="artist.isActive ? 'success' : 'neutral'">
          {{ artist.isActive ? 'Activo' : 'Inactivo' }}
        </BaseBadge>

        <BaseBadge v-if="artist.country" kind="tag" size="sm">
          {{ artist.country }}
        </BaseBadge>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5 sm:p-6">
      <div class="space-y-2">
        <h3 class="text-lg font-semibold leading-tight text-highlighted">
          {{ artist.name }}
        </h3>

        <p v-if="artist.bio" class="line-clamp-3 text-sm leading-relaxed text-toned">
          {{ artist.bio }}
        </p>
        <p v-else class="text-sm leading-relaxed text-toned">
          Explorá sus géneros, recorrido y presencia activa en la cartelera.
        </p>
      </div>

      <div v-if="featuredGenres.length" class="flex flex-wrap gap-2">
        <BaseBadge
          v-for="genre in featuredGenres"
          :key="genre.id"
          kind="tag"
          size="sm"
        >
          {{ genre.name }}
        </BaseBadge>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p class="text-xs leading-relaxed text-muted">
          {{ artist.genres.length }} género{{ artist.genres.length === 1 ? '' : 's' }} asociado{{ artist.genres.length === 1 ? '' : 's' }}
        </p>

        <BaseButton
          v-if="artist.website"
          :href="artist.website"
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
  </UiPanel>
</template>

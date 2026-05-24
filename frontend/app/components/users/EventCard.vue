<script setup lang="ts">
import type { MyEventItem, TicketStatus } from '~~/shared/types'

const props = defineProps<{
  item: MyEventItem
  isFavorited?: boolean
  favoriteLoading?: boolean
}>()

const emit = defineEmits<{
  toggleFavorite: []
  viewDetail: []
}>()

const statusBadgeColor = computed((): 'success' | 'neutral' | 'error' | 'warning' => {
  const map: Record<TicketStatus, 'success' | 'neutral' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    USED: 'neutral',
    CANCELLED: 'error',
    REFUNDED: 'warning',
  }

  return map[props.item.dominantStatus]
})

const statusBadgeLabel = computed((): string => {
  const map: Record<TicketStatus, string> = {
    ACTIVE: 'Activo',
    USED: 'Usado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  }

  return map[props.item.dominantStatus]
})

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(props.item.event.eventDate))
})

const ticketLabel = computed(() =>
  props.item.ticketCount === 1 ? '1 entrada' : `${props.item.ticketCount} entradas`,
)
</script>

<template>
  <UiPanel
    as="article"
    variant="glass"
    radius="xl"
    padding="none"
    :interactive="true"
    class="group flex h-full flex-row overflow-hidden"
  >
    <!-- Media -->
    <div
      class="relative aspect-square w-32 shrink-0 overflow-hidden border-r border-white/10 transition-colors duration-200 group-hover:border-lavender/35 group-focus-within:border-lavender/35 sm:w-36 lg:w-40"
    >
      <NuxtImg
        v-if="item.event.imageUrl"
        :src="item.event.imageUrl"
        :alt="`Imagen de ${item.event.name}`"
        class="h-full w-full object-cover transition duration-300"
        loading="lazy"
        width="900"
        height="600"
        sizes="(max-width: 639px) 8rem, (max-width: 1023px) 9rem, 10rem"
        placeholder
      />

      <div
        v-else
        class="flex h-full items-center justify-center bg-linear-to-br from-elevated/40 via-elevated/25 to-elevated/40"
      >
        <BaseIcon name="i-lucide-image" class="size-12 text-muted/50" />
      </div>

      <div
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent"
      />

      <!-- Status badge — top left -->
      <div class="absolute left-3 top-3">
        <BaseBadge kind="status" size="sm" :color="statusBadgeColor">
          {{ statusBadgeLabel }}
        </BaseBadge>
      </div>

      <!-- Ticket count badge — top right -->
      <div class="absolute right-3 top-3">
        <BaseBadge kind="tag" size="sm" icon="i-lucide-ticket">
          {{ ticketLabel }}
        </BaseBadge>
      </div>
    </div>

    <!-- Content -->
    <div class="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">
      <div class="space-y-1.5">
        <h3 class="line-clamp-2 text-base font-semibold leading-tight text-highlighted sm:text-lg">
          {{ item.event.name }}
        </h3>

        <p class="text-sm leading-relaxed text-toned">
          {{ formattedDate }} · {{ item.event.venue.name }}
        </p>

        <p v-if="item.event.format" class="text-xs text-muted">
          {{ item.event.format.name }}
        </p>
      </div>

      <!-- Actions -->
      <div
        class="mt-auto flex items-center gap-3 border-t border-white/10 pt-4 transition-colors duration-200 group-hover:border-lavender/35 group-focus-within:border-lavender/35"
      >
        <BaseButton
          :variant="isFavorited ? 'reversed' : 'outlined'"
          size="xs"
          :loading="favoriteLoading"
          leading-icon="i-lucide-heart"
          :class="isFavorited ? 'shadow-[0_14px_28px_-22px_rgba(166,102,255,0.9)]' : 'text-toned'"
          :aria-label="isFavorited ? 'Quitar de favoritos' : 'Guardar en favoritos'"
          @click.stop="emit('toggleFavorite')"
        >
          {{ isFavorited ? 'Guardado' : 'Guardar' }}
        </BaseButton>

        <BaseButton
          variant="secondary"
          size="xs"
          trailing-icon="i-lucide-arrow-right"
          class="ml-auto"
          @click.stop="emit('viewDetail')"
        >
          Ver
        </BaseButton>
      </div>
    </div>
  </UiPanel>
</template>

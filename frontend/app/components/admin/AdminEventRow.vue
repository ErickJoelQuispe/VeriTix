<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  to?: string
  eventDate?: string | null
  venueName?: string
  venueCity?: string
  imageUrl?: string | null
  status?: string
  active?: boolean
  compact?: boolean
}>(), {
  to: '',
  eventDate: null,
  venueName: '',
  venueCity: '',
  imageUrl: null,
  status: '',
  active: false,
  compact: false,
})

const cardVariant = computed(() => {
  if (props.active) {
    return 'primary'
  }

  if (props.status === 'DRAFT') {
    return 'warning'
  }

  return 'default'
})

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Sin fecha definida'
  }

  return new Date(value).toLocaleString('es-ES', {
    dateStyle: props.compact ? 'medium' : 'long',
    timeStyle: 'short',
  })
}
</script>

<template>
  <AdminCard
    :variant="cardVariant"
    hover
    :padding="compact ? 'compact' : 'default'"
    class="group flex flex-col gap-4 !border-default/65 !bg-elevated/25 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 items-center gap-4 sm:gap-5">
      <div class="flex size-16 shrink-0 self-center items-center justify-center overflow-hidden rounded-xl border border-default/60 bg-default/50">
        <img v-if="imageUrl" :src="imageUrl" :alt="title" class="size-full object-cover">
        <UIcon v-else name="i-lucide-calendar-range" class="size-5 text-muted" />
      </div>

      <div class="min-w-0 space-y-2.5">
        <div class="flex flex-wrap items-center gap-2.5">
          <p class="truncate text-base font-semibold text-highlighted">
            <NuxtLink
              v-if="to"
              :to="to"
              class="rounded-sm transition-colors duration-150 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
            >
              {{ title }}
            </NuxtLink>
            <span v-else>{{ title }}</span>
          </p>

          <slot name="badges" />
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-toned">
          <div class="flex items-center gap-2.5">
            <UIcon name="i-lucide-clock-3" class="size-4 shrink-0 text-muted" />
            <span>{{ formatDate(eventDate) }}</span>
          </div>

          <div v-if="venueName || venueCity" class="flex min-w-0 items-center gap-2.5">
            <UIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-muted" />
            <span class="truncate">{{ venueName }}<template v-if="venueName && venueCity"> · </template>{{ venueCity }}</span>
          </div>
        </div>

        <div v-if="$slots.details" class="pt-1">
          <slot name="details" />
        </div>
      </div>
    </div>

    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center justify-start gap-2.5 pt-1 sm:justify-end sm:pt-0">
      <slot name="actions" />
    </div>
  </AdminCard>
</template>

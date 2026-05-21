<script setup lang="ts">
const props = defineProps<{
  validated: number
  capacity: number
  occupancy: number
  loading?: boolean
}>()

// ── SVG donut geometry ───────────────────────────────────────────────────────
const SIZE = 160
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Smooth animated fill pct
const animatedPct = ref(0)
let raf: number | null = null

watch(() => props.occupancy, (next) => {
  if (raf !== null) cancelAnimationFrame(raf)
  const start = animatedPct.value
  const delta = next - start
  const duration = 600
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    animatedPct.value = start + delta * eased
    if (progress < 1) raf = requestAnimationFrame(step)
    else { animatedPct.value = next; raf = null }
  }
  raf = requestAnimationFrame(step)
}, { immediate: true })

onUnmounted(() => { if (raf !== null) cancelAnimationFrame(raf) })

const dashOffset = computed(() =>
  CIRCUMFERENCE - (animatedPct.value / 100) * CIRCUMFERENCE,
)

// ── Color thresholds ─────────────────────────────────────────────────────────
// oklch tokens from main.css
const ringColor = computed(() => {
  if (animatedPct.value >= 90) return 'var(--color-error)'
  if (animatedPct.value >= 75) return 'var(--color-warning)'
  return 'var(--color-success)'
})

const labelColor = computed(() => {
  if (animatedPct.value >= 90) return 'text-error'
  if (animatedPct.value >= 75) return 'text-warning'
  return 'text-success'
})
</script>

<template>
  <UiPanel variant="glass" radius="md" padding="lg">
    <div class="mb-4 flex items-center gap-2">
      <BaseIcon name="i-lucide-building-2" class="size-4 text-toned" />
      <UiMetaLabel tone="accent">
        Aforo del venue
      </UiMetaLabel>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center gap-4 py-4">
      <BaseSkeleton class="size-40 rounded-full" />
      <BaseSkeleton class="h-4 w-32" />
    </div>

    <div v-else class="flex flex-col items-center gap-5">
      <!-- SVG donut -->
      <div class="relative">
        <svg
          :width="SIZE"
          :height="SIZE"
          :viewBox="`0 0 ${SIZE} ${SIZE}`"
          class="-rotate-90"
          aria-hidden="true"
        >
          <!-- Track -->
          <circle
            :cx="SIZE / 2"
            :cy="SIZE / 2"
            :r="RADIUS"
            fill="none"
            stroke="currentColor"
            class="text-default/40"
            :stroke-width="STROKE"
            stroke-linecap="round"
          />
          <!-- Fill -->
          <circle
            :cx="SIZE / 2"
            :cy="SIZE / 2"
            :r="RADIUS"
            fill="none"
            :stroke="ringColor"
            :stroke-width="STROKE"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            style="transition: stroke-dashoffset 0.05s linear, stroke 0.4s ease"
          />
        </svg>

        <!-- Center label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            class="text-3xl font-semibold tabular-nums leading-none transition-colors duration-400"
            :class="labelColor"
          >
            {{ Math.round(animatedPct) }}%
          </span>
          <span class="text-xs text-muted">aforo</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="w-full space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-toned">Dentro</span>
          <span class="font-semibold tabular-nums text-highlighted">{{ validated }}</span>
        </div>
        <div class="h-px w-full bg-default/40" />
        <div class="flex items-center justify-between">
          <span class="text-toned">Capacidad</span>
          <span class="font-semibold tabular-nums text-highlighted">{{ capacity }}</span>
        </div>
        <div class="h-px w-full bg-default/40" />
        <div class="flex items-center justify-between">
          <span class="text-toned">Disponibles</span>
          <span class="tabular-nums text-toned">{{ Math.max(capacity - validated, 0) }}</span>
        </div>
      </div>
    </div>
  </UiPanel>
</template>

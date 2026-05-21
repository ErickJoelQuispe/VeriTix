<script setup lang="ts">
import type { AccessStatsSnapshot } from '~/composables/backoffice/useAccessStatsStream'

const props = defineProps<{
  history: AccessStatsSnapshot[]
  loading?: boolean
}>()

const MAX_BARS = 20
const BAR_HEIGHT = 80

// ── Compute per-snapshot validation delta (rate) ─────────────────────────────
// Each bar = how many NEW validations happened since the previous snapshot.

const bars = computed(() => {
  const items = props.history.slice(-MAX_BARS)
  if (items.length < 2) return []

  const deltas = items.map((snap, i) => {
    if (i === 0) return { delta: 0, snap }
    const prev = items[i - 1]
    return { delta: Math.max(snap.validated - prev.validated, 0), snap }
  }).slice(1) // drop first (no previous)

  const max = Math.max(...deltas.map(d => d.delta), 1)

  return deltas.map(({ delta, snap }) => ({
    heightPct: (delta / max) * 100,
    delta,
    time: snap.lastUpdated
      ? new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(snap.lastUpdated))
      : '',
    validated: snap.validated,
  }))
})

const hasData = computed(() => bars.value.length > 0)

const totalRate = computed(() => {
  if (bars.value.length === 0) return 0
  return bars.value.reduce((acc, b) => acc + b.delta, 0)
})
</script>

<template>
  <PagesBackofficeOverviewPanel
    eyebrow="Ritmo de entrada"
    title="Validaciones por momento"
    description="Cada barra representa la cantidad de validaciones entre snapshots consecutivos."
    variant="glass"
  >
    <template #actions>
      <BaseBadge kind="tag" size="sm" color="primary">
        {{ totalRate }} en esta vista
      </BaseBadge>
    </template>

    <!-- Loading -->
    <div v-if="loading" class="flex items-end gap-1" :style="{ height: `${BAR_HEIGHT}px` }">
      <BaseSkeleton
        v-for="i in 12"
        :key="i"
        class="flex-1 rounded-t"
        :style="{ height: `${20 + Math.random() * 60}%` }"
      />
    </div>

    <!-- No data yet -->
    <div
      v-else-if="!hasData"
      class="flex items-center justify-center gap-3 py-8 text-center"
      :style="{ minHeight: `${BAR_HEIGHT + 24}px` }"
    >
      <BaseIcon name="i-lucide-activity" class="size-4 text-muted" />
      <p class="text-sm text-toned">
        Esperando datos del stream…
      </p>
    </div>

    <!-- Sparkline bars -->
    <div v-else class="space-y-2">
      <div
        class="flex items-end gap-0.5"
        :style="{ height: `${BAR_HEIGHT}px` }"
      >
        <div
          v-for="(bar, i) in bars"
          :key="i"
          class="group relative flex-1 cursor-default"
          :style="{ height: '100%' }"
        >
          <!-- Bar -->
          <div
            class="absolute bottom-0 w-full rounded-t transition-all duration-500 ease-out"
            :class="bar.delta > 0 ? 'bg-success/60 group-hover:bg-success/85' : 'bg-default/30'"
            :style="{ height: `${Math.max(bar.heightPct, bar.delta > 0 ? 4 : 2)}%` }"
          />

          <!-- Tooltip -->
          <div
            class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-default/70 bg-elevated/95 px-2.5 py-2 text-center shadow-xl backdrop-blur-sm group-hover:block"
          >
            <p class="text-xs font-semibold text-highlighted tabular-nums">
              +{{ bar.delta }}
            </p>
            <p class="mt-0.5 text-[0.6rem] text-muted">
              {{ bar.time }}
            </p>
          </div>
        </div>
      </div>

      <!-- X-axis labels -->
      <div class="flex justify-between text-[0.6rem] font-semibold uppercase tracking-widest text-toned/50">
        <span>{{ bars.at(0)?.time }}</span>
        <span>{{ bars.at(-1)?.time }}</span>
      </div>
    </div>
  </PagesBackofficeOverviewPanel>
</template>

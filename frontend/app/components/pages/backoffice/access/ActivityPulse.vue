<script setup lang="ts">
const props = defineProps<{
  lastUpdated: string | null   // ISO string from snapshot
  updatesReceived: number
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
}>()

// ── Seconds since last update ────────────────────────────────────────────────

const secondsAgo = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function resetTimer() {
  secondsAgo.value = 0
}

watch(() => props.lastUpdated, (val) => {
  if (!val) return
  resetTimer()
})

onMounted(() => {
  timer = setInterval(() => {
    if (props.lastUpdated) secondsAgo.value++
  }, 1000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })

// ── Label ────────────────────────────────────────────────────────────────────

const agoLabel = computed(() => {
  if (!props.lastUpdated) return 'Sin actividad'
  if (secondsAgo.value < 5) return 'Ahora mismo'
  if (secondsAgo.value < 60) return `Hace ${secondsAgo.value}s`
  const mins = Math.floor(secondsAgo.value / 60)
  return `Hace ${mins}min`
})

// ── Status tone ──────────────────────────────────────────────────────────────

const statusTone = computed(() => {
  if (props.hasError) return 'error' as const
  if (props.isConnecting) return 'warning' as const
  if (!props.isConnected) return 'neutral' as const
  if (secondsAgo.value > 30) return 'warning' as const
  return 'success' as const
})

const dotClass = computed(() => {
  const map = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    neutral: 'bg-muted',
  }
  return map[statusTone.value]
})

const pulseClass = computed(() =>
  statusTone.value === 'success' || statusTone.value === 'warning' ? 'animate-pulse' : '',
)

const statusLabel = computed(() => {
  if (props.hasError) return 'Sin conexión'
  if (props.isConnecting) return 'Conectando…'
  if (!props.isConnected) return 'Desconectado'
  if (secondsAgo.value > 30) return 'Sin actividad reciente'
  return 'En vivo'
})

const badgeColor = computed(() => statusTone.value === 'neutral' ? 'neutral' as const : statusTone.value)
</script>

<template>
  <UiPanel variant="glass" radius="md" padding="md">
    <div class="flex items-center justify-between gap-4">

      <!-- Left: pulse dot + labels -->
      <div class="flex items-center gap-3">
        <div class="relative flex size-8 shrink-0 items-center justify-center">
          <!-- Ping ring — only when live and recent -->
          <span
            v-if="statusTone === 'success'"
            class="absolute inline-flex size-full rounded-full opacity-60"
            :class="[dotClass, 'animate-ping']"
          />
          <span
            class="relative inline-flex size-3 rounded-full"
            :class="[dotClass, pulseClass]"
          />
        </div>

        <div class="space-y-0.5">
          <p class="text-sm font-medium text-highlighted">
            {{ agoLabel }}
          </p>
          <p class="text-xs text-muted">
            {{ updatesReceived }} actualizaciones en esta sesión
          </p>
        </div>
      </div>

      <!-- Right: badge -->
      <BaseBadge kind="status" size="sm" :color="badgeColor">
        {{ statusLabel }}
      </BaseBadge>

    </div>
  </UiPanel>
</template>

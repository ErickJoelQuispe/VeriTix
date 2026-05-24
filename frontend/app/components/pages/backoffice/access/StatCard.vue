<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  hint: string
  icon: string
  tone: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  loading?: boolean
}>()

// ── Animated counter ────────────────────────────────────────────────────────
// Smoothly interpolates to the new value over ~400ms when it changes.

const displayed = ref(props.value)
let raf: number | null = null

watch(() => props.value, (next) => {
  if (raf !== null) { cancelAnimationFrame(raf) }

  const start = displayed.value
  const delta = next - start
  if (delta === 0) { return }

  const duration = 400
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    // ease-out cubic
    const eased = 1 - (1 - progress) ** 3
    displayed.value = Math.round(start + delta * eased)
    if (progress < 1) {
      raf = requestAnimationFrame(step)
    }
    else {
      displayed.value = next
      raf = null
    }
  }

  raf = requestAnimationFrame(step)
}, { immediate: false })

onUnmounted(() => {
  if (raf !== null) { cancelAnimationFrame(raf) }
})

// ── Icon box class ───────────────────────────────────────────────────────────

const iconBoxClass = computed(() => {
  const base = 'flex size-10 shrink-0 items-center justify-center rounded-lg border'
  const map: Record<typeof props.tone, string> = {
    primary: 'border-primary/20 bg-primary/10 text-primary',
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    error: 'border-error/20 bg-error/10 text-error',
    neutral: 'border-default bg-default/60 text-muted',
  }
  return `${base} ${map[props.tone]}`
})

const valueClass = computed(() => {
  const map: Record<typeof props.tone, string> = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    neutral: 'text-highlighted',
  }
  return map[props.tone]
})
</script>

<template>
  <UiPanel variant="glass" radius="md" padding="md">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <BaseSkeleton class="mb-4 size-10 rounded-lg" />
      <BaseSkeleton class="mb-2 h-8 w-16" />
      <BaseSkeleton class="h-4 w-24" />
    </template>

    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 space-y-3">
          <UiMetaLabel>{{ label }}</UiMetaLabel>
          <div class="space-y-1">
            <p
              class="text-2xl font-semibold tracking-tight tabular-nums transition-colors duration-300 sm:text-3xl"
              :class="valueClass"
            >
              {{ displayed }}
            </p>
            <p class="truncate text-sm text-toned">
              {{ hint }}
            </p>
          </div>
        </div>
        <div :class="iconBoxClass">
          <BaseIcon :name="icon" class="size-5" />
        </div>
      </div>
    </template>
  </UiPanel>
</template>

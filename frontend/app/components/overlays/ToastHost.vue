<script setup lang="ts">
const { toasts, remove } = useToastQueue()

const colorClasses: Record<'error' | 'success' | 'info' | 'warning' | 'neutral', string> = {
  error: 'border-error/30 bg-error/12 text-error',
  success: 'border-success/30 bg-success/12 text-success',
  info: 'border-info/30 bg-info/12 text-info',
  warning: 'border-warning/30 bg-warning/12 text-warning',
  neutral: 'border-default/60 bg-elevated/80 text-toned',
}
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-atomic="true">
    <TransitionGroup tag="div" name="toast" class="flex flex-col gap-3">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-lg"
        :class="colorClasses[toast.color]"
        role="status"
      >
        <div class="flex items-start gap-3">
          <BaseIcon :name="toast.icon" class="mt-0.5 size-5 shrink-0" />

          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-sm font-semibold text-highlighted">
              {{ toast.title }}
            </p>
            <p class="text-sm leading-relaxed text-toned">
              {{ toast.description }}
            </p>
          </div>

          <button
            type="button"
            class="rounded-md p-1 text-toned transition-colors hover:text-highlighted"
            aria-label="Cerrar notificación"
            @click="remove(toast.id)"
          >
            <BaseIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>

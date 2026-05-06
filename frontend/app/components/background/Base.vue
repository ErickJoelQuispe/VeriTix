<script setup lang="ts">
defineProps<{
  intensity?: number
}>()
</script>

<template>
  <div
    aria-hidden="true"
    class="vtx-bg-base pointer-events-none fixed inset-0 -z-30"
    :style="{ opacity: intensity ?? 1 }"
  />
</template>

<style scoped>
.vtx-bg-base {
  background:
    radial-gradient(circle at 50% 10%, color-mix(in oklch, var(--color-error) 12%, transparent) 0%, transparent 34%),
    radial-gradient(circle at 78% 16%, color-mix(in oklch, var(--color-primary) 8%, transparent) 0%, transparent 28%),
    radial-gradient(circle at 24% 28%, color-mix(in oklch, var(--color-secondary) 9%, transparent) 0%, transparent 24%),
    var(--color-default);
}
</style>

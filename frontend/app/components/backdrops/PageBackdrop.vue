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
    radial-gradient(circle at 12% 8%, color-mix(in oklch, var(--color-accent) 24%, transparent) 0%, transparent 38%),
    radial-gradient(circle at 28% 18%, color-mix(in oklch, var(--color-accent) 8%, transparent) 0%, transparent 26%),
    radial-gradient(circle at 88% 92%, color-mix(in oklch, var(--color-accent) 16%, transparent) 0%, transparent 46%),
    radial-gradient(circle at 76% 80%, color-mix(in oklch, var(--color-accent) 6%, transparent) 0%, transparent 28%),
    var(--color-default);
}
</style>

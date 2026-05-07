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
    radial-gradient(circle at 50% 8%, color-mix(in oklch, var(--color-error) 18%, transparent) 0%, transparent 38%),
    radial-gradient(circle at 76% 14%, color-mix(in oklch, var(--color-primary) 5%, transparent) 0%, transparent 28%),
    radial-gradient(circle at 22% 24%, color-mix(in oklch, var(--color-info) 5%, transparent) 0%, transparent 24%),
    var(--color-default);
}
</style>

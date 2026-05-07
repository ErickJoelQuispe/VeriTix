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
    radial-gradient(circle at 14% 16%, rgb(239 170 71 / 0.22), transparent 30%),
    radial-gradient(circle at 84% 14%, rgb(20 128 188 / 0.26), transparent 33%),
    radial-gradient(ellipse at 56% 52%, rgb(24 31 52 / 0.9), rgb(14 20 35 / 0.88) 60%);
}
</style>

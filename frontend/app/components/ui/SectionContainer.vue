<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <section
    :id="id"
    class="vtx-section-fade relative scroll-mt-36 py-14 sm:scroll-mt-40 sm:py-16 lg:scroll-mt-44 lg:py-24"
  >
    <UContainer>
      <slot />
    </UContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-section-fade::before {
  @apply absolute left-0 right-0 top-0 h-px pointer-events-none;
  @apply w-[min(24rem,64vw)];
  background: linear-gradient(90deg, rgb(239 170 71 / 0.7), rgb(20 128 188 / 0.45), rgb(255 255 255 / 0));
}

.vtx-section-fade {
  animation: section-fade-in 700ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-section-fade {
    @apply opacity-100;
    animation: none;
    transform: none;
  }
}

@keyframes section-fade-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

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
    <BackgroundSectionGlow />
    <BaseContainer>
      <slot />
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

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

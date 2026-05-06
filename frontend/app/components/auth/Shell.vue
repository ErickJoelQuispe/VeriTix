<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'login' | 'register'
  }>(),
  {
    variant: 'login',
  },
)
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" :data-variant="props.variant">
    <div class="relative z-10 px-4 py-16 sm:py-20">
      <div class="vtx-prism-shell mx-auto w-full max-w-xl">
        <slot />
      </div>
    </div>
  </div>
</template>

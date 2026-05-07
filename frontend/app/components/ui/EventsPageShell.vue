<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'index' | 'detail'
    containerClass?: string
  }>(),
  {
    variant: 'index',
    containerClass: '',
  },
)
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-primary/10 via-transparent to-transparent" />

      <template v-if="props.variant === 'index'">
        <div class="absolute -left-12 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div class="absolute right-0 top-10 h-64 w-64 rounded-full bg-auric-500/10 blur-3xl" />
      </template>

      <template v-else>
        <div class="absolute -left-12 top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div class="absolute right-0 top-12 h-64 w-64 rounded-full bg-auric-500/10 blur-3xl" />
      </template>
    </div>

    <UContainer :class="props.containerClass">
      <slot />
    </UContainer>
  </section>
</template>

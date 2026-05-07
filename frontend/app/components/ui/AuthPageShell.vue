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
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <template v-if="props.variant === 'login'">
        <div class="absolute left-1/2 -top-56 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
        <div class="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-secondary/12 blur-3xl" />
        <div class="absolute -left-24 bottom-12 h-64 w-64 rounded-full bg-auric-500/12 blur-3xl" />
        <div class="absolute left-[8%] top-32 hidden h-40 w-40 rounded-full border border-auric-200/20 bg-linear-to-br from-auric-200/14 to-transparent blur-sm md:block" />
        <div class="absolute right-[10%] bottom-28 hidden h-32 w-32 rounded-full border border-electric-300/20 bg-linear-to-br from-electric-200/14 to-transparent blur-sm lg:block" />
        <div class="absolute left-[18%] bottom-[18%] hidden h-px w-44 bg-linear-to-r from-transparent via-auric-300/35 to-transparent md:block" />
        <div class="absolute right-[16%] top-[22%] hidden h-px w-36 bg-linear-to-r from-transparent via-electric-300/35 to-transparent lg:block" />
      </template>

      <template v-else>
        <div class="absolute left-1/2 -top-56 h-96 w-96 -translate-x-1/2 rounded-full bg-auric-500/18 blur-3xl" />
        <div class="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-secondary/16 blur-3xl" />
        <div class="absolute -left-24 bottom-12 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
        <div class="absolute right-[10%] top-24 hidden h-40 w-40 rounded-full border border-secondary/24 bg-linear-to-br from-secondary/14 to-transparent blur-sm md:block" />
        <div class="absolute left-[9%] bottom-24 hidden h-36 w-36 rounded-full border border-auric-300/22 bg-linear-to-br from-auric-300/14 to-transparent blur-sm lg:block" />
        <div class="absolute right-[20%] bottom-[20%] hidden h-px w-40 bg-linear-to-r from-transparent via-secondary/35 to-transparent md:block" />
        <div class="absolute left-[18%] top-[24%] hidden h-px w-32 bg-linear-to-r from-transparent via-auric-300/35 to-transparent lg:block" />
      </template>
    </div>

    <slot />
  </div>
</template>

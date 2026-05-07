<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    center?: boolean
    actionLabel?: string
    actionTo?: RouteLocationRaw
  }>(),
  {
    eyebrow: '',
    description: '',
    center: false,
    actionLabel: '',
    actionTo: undefined,
  },
)
</script>

<template>
  <div
    class="w-full border-b border-white/16 pb-8"
    :class="center ? 'mx-auto text-center' : 'text-left'"
  >
    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-3" :class="center ? 'mx-auto' : ''">
        <p
          v-if="eyebrow"
          class="font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase"
        >
          {{ eyebrow }}
        </p>

        <h2 class="max-w-3xl font-display text-5xl leading-none tracking-tight text-highlighted md:text-6xl lg:text-7xl">
          {{ title }}
        </h2>
      </div>

      <BaseButton
        v-if="actionTo && actionLabel"
        :to="actionTo"
        kind="secondary"
        size="sm"
        trailing-icon="i-lucide-arrow-right"
        class="shrink-0 lg:ml-auto"
      >
        {{ actionLabel }}
      </BaseButton>
    </div>

    <p
      v-if="description"
      class="max-w-2xl text-sm leading-relaxed text-toned md:text-base"
      :class="center ? 'mx-auto' : ''"
    >
      {{ description }}
    </p>
  </div>
</template>

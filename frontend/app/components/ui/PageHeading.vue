<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
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

const hasAction = computed(() => Boolean(props.actionLabel && props.actionTo))
</script>

<template>
  <header class="border-b border-white/16 pb-8 pt-3 sm:pt-4">
    <div
      data-test="page-heading-content"
      class="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      :class="center ? 'items-center text-center lg:flex-col' : ''"
    >
      <div
        data-test="page-heading-title-group"
        class="min-w-0 space-y-4"
        :class="center ? 'mx-auto max-w-4xl' : 'max-w-4xl lg:flex-1'"
      >
        <UiMetaLabel
          v-if="eyebrow"
          tone="accent"
          data-test="page-heading-eyebrow"
          class="block"
        >
          {{ eyebrow }}
        </UiMetaLabel>

        <h1 class="font-display text-3xl leading-none tracking-tight text-highlighted sm:text-4xl lg:text-6xl">
          {{ title }}
        </h1>

        <p
          v-if="description"
          data-test="page-heading-description"
          class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base"
          :class="center ? 'mx-auto' : ''"
        >
          {{ description }}
        </p>
      </div>

      <BaseButton
        v-if="hasAction"
        :to="actionTo"
        variant="secondary"
        size="sm"
        trailing-icon="i-lucide-arrow-right"
        class="shrink-0"
        :class="center ? 'mx-auto' : 'lg:ml-auto'"
      >
        {{ actionLabel }}
      </BaseButton>
    </div>
  </header>
</template>

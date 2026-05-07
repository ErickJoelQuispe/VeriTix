<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  center?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  center: false,
})

const headingSizes = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-4xl sm:text-5xl',
}
</script>

<template>
  <div
    class="space-y-3"
    :class="center ? 'text-center' : ''"
  >
    <div v-if="subtitle" class="space-y-1">
      <UiMetaLabel :tone="center ? 'default' : 'accent'">
        {{ subtitle }}
      </UiMetaLabel>
    </div>

    <h1
      class="font-display text-highlighted"
      :class="headingSizes[size]"
    >
      {{ title }}
    </h1>

    <p
      v-if="description"
      class="text-sm leading-relaxed text-toned sm:text-base"
    >
      {{ description }}
    </p>
  </div>
</template>

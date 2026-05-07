<script setup lang="ts">
interface Props {
  title: string
  eyebrow?: string
  description?: string
  center?: boolean
}

withDefaults(defineProps<Props>(), {
  center: false,
})
</script>

<template>
  <div
    class="space-y-2 border-b border-default/55 pb-5"
    :class="center ? 'text-center' : ''"
  >
    <UiMetaLabel v-if="eyebrow" :tone="center ? 'default' : 'accent'">
      {{ eyebrow }}
    </UiMetaLabel>

    <h2 class="text-2xl font-semibold text-highlighted">
      {{ title }}
    </h2>

    <p
      v-if="description"
      class="max-w-2xl text-sm leading-relaxed text-toned"
    >
      {{ description }}
    </p>
  </div>
</template>

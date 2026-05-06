<script setup lang="ts">
defineProps<{
  title: string
  status?: string
}>()
</script>

<template>
  <UiGlassPanel tone="subtle" padding="md" radius="sm">
    <div class="flex items-center justify-between gap-3">
      <UiMetaLabel as="h3" tone="accent">
        {{ title }}
      </UiMetaLabel>
      <span v-if="status" class="text-xs font-medium text-dimmed uppercase">
        {{ status }}
      </span>
    </div>

    <div class="mt-4">
      <slot />
    </div>
  </UiGlassPanel>
</template>

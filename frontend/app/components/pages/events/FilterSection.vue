<script setup lang="ts">
defineProps<{
  title: string
  status?: string
}>()
</script>

<template>
  <section class="space-y-3 border-t border-default/45 pt-5 first:border-t-0 first:pt-0">
    <div class="flex items-center justify-between gap-3">
      <UiMetaLabel as="h3" tone="accent">
        {{ title }}
      </UiMetaLabel>
      <span v-if="status" class="text-xs font-medium text-dimmed uppercase">
        {{ status }}
      </span>
    </div>

    <div>
      <slot />
    </div>
  </section>
</template>

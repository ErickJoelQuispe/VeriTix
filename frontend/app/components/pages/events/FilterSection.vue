<script setup lang="ts">
defineProps<{
  title: string
  status?: string
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <UiMetaLabel as="h3" tone="accent">
        {{ title }}
      </UiMetaLabel>
      <span v-if="status" class="text-[11px] font-medium uppercase tracking-wide text-dimmed">
        {{ status }}
      </span>
    </div>

    <div>
      <slot />
    </div>
  </section>
</template>

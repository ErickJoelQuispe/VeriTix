<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  eyebrow?: string
  variant?: 'solid' | 'glass'
}>(), {
  description: '',
  eyebrow: '',
  variant: 'glass',
})
</script>

<template>
  <UiPanel :variant="variant" radius="md" padding="lg">
    <div class="flex flex-col gap-4 border-b border-lavender/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-2">
        <UiMetaLabel v-if="eyebrow" tone="accent">
          {{ eyebrow }}
        </UiMetaLabel>

        <div class="space-y-1.5">
          <h2 class="text-xl font-semibold tracking-tight text-highlighted">
            {{ title }}
          </h2>
          <p v-if="description" class="max-w-2xl text-sm leading-relaxed text-toned">
            {{ description }}
          </p>
        </div>
      </div>

      <div v-if="$slots.actions" class="shrink-0 sm:self-center">
        <slot name="actions" />
      </div>
    </div>

    <div class="pt-5">
      <slot />
    </div>
  </UiPanel>
</template>

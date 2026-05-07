<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean
    disabled?: boolean
    label: string
    size?: 'xs' | 'sm' | 'md'
  }>(),
  {
    active: false,
    disabled: false,
    size: 'sm',
  },
)

const chipUi = {
  base: 'border border-default/70 bg-default/60 text-toned shadow-none transition-all duration-150 hover:border-primary/20 hover:bg-elevated hover:text-default focus-visible:border-primary/40 focus-visible:bg-elevated focus-visible:text-default',
} as const
</script>

<template>
  <UButton
    type="button"
    :size="props.size"
    :ui="chipUi"
    class="rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide"
    :disabled="props.disabled"
    :color="props.active ? 'primary' : 'neutral'"
    :variant="props.active ? 'soft' : 'outline'"
  >
    {{ props.label }}
  </UButton>
</template>

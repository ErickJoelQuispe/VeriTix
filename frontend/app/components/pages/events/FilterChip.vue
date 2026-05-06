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
</script>

<template>
  <BaseButton
    type="button"
    :size="props.size"
    class="rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide"
    :disabled="props.disabled"
    :kind="props.active ? 'primary' : 'secondary'"
  >
    {{ props.label }}
  </BaseButton>
</template>

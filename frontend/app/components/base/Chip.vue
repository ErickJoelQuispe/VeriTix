<script setup lang="ts">
interface Props {
  label: string
  size?: 'sm' | 'md'
  active?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  active: false,
  disabled: false,
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border border-default/60 bg-default/40 px-2.5 py-0.5 text-xs font-medium text-toned transition-colors"
    :class="[
      active ? 'border-primary/50 bg-primary/15 text-primary' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-default/80 hover:bg-default/55',
    ]"
  >
    {{ label }}
  </span>
</template>

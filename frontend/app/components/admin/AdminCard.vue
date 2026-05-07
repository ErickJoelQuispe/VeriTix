<script setup lang="ts">
export interface AdminCardProps {
  variant?: 'default' | 'compact' | 'warning' | 'success' | 'primary'
  hover?: boolean
  padding?: 'default' | 'compact' | 'none'
}

const props = withDefaults(defineProps<AdminCardProps>(), {
  variant: 'default',
  hover: false,
  padding: 'default',
})

const paddingClasses = computed(() => {
  if (props.padding === 'none') {
    return ''
  }
  if (props.padding === 'compact') {
    return 'p-5'
  }
  return 'p-6'
})

const variantClasses = computed(() => {
  if (props.variant === 'warning') {
    return 'border-warning/20 bg-warning/5'
  }
  if (props.variant === 'success') {
    return 'border-success/20 bg-success/5'
  }
  if (props.variant === 'primary') {
    return 'border-primary/20 bg-primary/5'
  }
  return 'border-default bg-default'
})

const hoverClasses = computed(() => {
  if (!props.hover) {
    return ''
  }
  return 'hover:shadow-md hover:-translate-y-0.5 hover:border-default cursor-pointer'
})
</script>

<template>
  <div
    class="rounded-2xl border shadow-sm transition-all duration-200 ease-out"
    :class="[
      paddingClasses,
      variantClasses,
      hoverClasses,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string
    variant?: 'solid' | 'glass'
    padding?: 'none' | 'md' | 'lg' | 'xl'
    radius?: 'md' | 'lg' | 'xl'
    interactive?: boolean
  }>(),
  {
    as: 'div',
    variant: 'solid',
    padding: 'md',
    radius: 'lg',
    interactive: false,
  },
)

const panelClass = computed(() => {
  const variantClass = props.variant === 'solid'
    ? 'border border-default/65 bg-elevated/72 shadow-sm backdrop-blur-md'
    : 'border border-default/70 bg-elevated/45 shadow-sm backdrop-blur-md ring-1 ring-inset ring-white/5'

  const radiusClass = {
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  }[props.radius]

  const paddingClass = {
    none: '',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
    xl: 'p-5 sm:p-7',
  }[props.padding]

  const interactiveClass = props.interactive
    ? props.variant === 'solid'
      ? 'transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-lavender/35 hover:bg-elevated/78 hover:shadow-md focus-within:-translate-y-1 focus-within:border-lavender/35 focus-within:bg-elevated/78'
      : 'transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-lavender/35 hover:bg-elevated/52 hover:shadow-md focus-within:-translate-y-1 focus-within:border-lavender/35 focus-within:bg-elevated/52'
    : ''

  return [variantClass, radiusClass, paddingClass, interactiveClass]
})
</script>

<template>
  <component :is="props.as" :class="panelClass">
    <slot />
  </component>
</template>

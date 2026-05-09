<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string
    variant?: 'solid' | 'glass'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    radius?: 'sm' | 'md' | 'lg' | 'xl'
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
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  }[props.radius]

  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[props.padding]

  const interactiveClass = props.interactive
    ? props.variant === 'solid'
      ? 'transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px hover:border-default/75 hover:bg-elevated/76 focus-within:-translate-y-px focus-within:border-default/75 focus-within:bg-elevated/76'
      : 'transition-[border-color,background-color,box-shadow] duration-200 hover:border-default/60 hover:bg-elevated/50 hover:shadow-md focus-within:border-default/60 focus-within:bg-elevated/50'
    : ''

  return [variantClass, radiusClass, paddingClass, interactiveClass]
})
</script>

<template>
  <component :is="props.as" :class="panelClass">
    <slot />
  </component>
</template>

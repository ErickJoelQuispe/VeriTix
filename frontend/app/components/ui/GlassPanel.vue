<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    as?: string
    tone?: 'strong' | 'subtle'
    padding?: 'sm' | 'md' | 'lg'
    radius?: 'sm' | 'md' | 'lg' | 'xl'
    interactive?: boolean
  }>(),
  {
    as: 'div',
    tone: 'strong',
    padding: 'md',
    radius: 'lg',
    interactive: false,
  },
)

const panelClass = computed(() => {
  const toneClass = props.tone === 'strong'
    ? 'border border-default/60 bg-elevated/60 shadow-xl backdrop-blur-lg'
    : 'border border-default/60 bg-default/25 shadow-sm'

  const radiusClass = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  }[props.radius]

  const paddingClass = {
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[props.padding]

  const interactiveClass = props.interactive
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-default/75 hover:bg-elevated/70 focus-within:-translate-y-0.5 focus-within:border-default/75 focus-within:bg-elevated/70'
    : ''

  return [toneClass, radiusClass, paddingClass, interactiveClass]
})
</script>

<template>
  <component :is="props.as" :class="panelClass">
    <slot />
  </component>
</template>

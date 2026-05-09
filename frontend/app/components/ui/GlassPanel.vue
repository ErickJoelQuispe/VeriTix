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
    ? 'border border-default/65 bg-elevated/72 shadow-sm backdrop-blur-md'
    : 'border border-default/45 bg-elevated/30 shadow-none backdrop-blur-[1px] ring-1 ring-inset ring-white/5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.035)]'

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
    ? props.tone === 'strong'
      ? 'transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px hover:border-default/75 hover:bg-elevated/76 focus-within:-translate-y-px focus-within:border-default/75 focus-within:bg-elevated/76'
      : 'transition-[border-color,background-color] duration-200 hover:border-default/60 hover:bg-elevated/36 focus-within:border-default/60 focus-within:bg-elevated/36'
    : ''

  return [toneClass, radiusClass, paddingClass, interactiveClass]
})
</script>

<template>
  <component :is="props.as" :class="panelClass">
    <slot />
  </component>
</template>

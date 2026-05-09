<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  kind?: BadgeKind
  color?: BadgeColor
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  leading?: boolean
}>(), {
  kind: 'status',
  color: undefined,
  size: 'xs',
  icon: undefined,
  leading: undefined,
})

type BadgeKind = 'status' | 'tag' | 'outline' | 'info' | 'role' | 'price' | 'accent'
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type BadgeVariant = 'soft' | 'subtle' | 'outline'

const attrs = useAttrs()

function resolveDefaults(kind: BadgeKind, explicitColor?: BadgeColor): { color: BadgeColor, variant: BadgeVariant } {
  switch (kind) {
    case 'status':
      return { color: explicitColor ?? 'neutral', variant: 'soft' as const }
    case 'tag':
      return { color: 'neutral', variant: 'subtle' as const }
    case 'outline':
      return { color: explicitColor ?? 'neutral', variant: 'outline' as const }
    case 'info':
      return { color: 'neutral', variant: 'soft' as const }
    case 'role':
      return { color: 'primary', variant: 'soft' as const }
    case 'price':
      return { color: 'primary', variant: 'soft' as const }
    case 'accent':
      return { color: explicitColor ?? 'primary', variant: 'soft' as const }
    default:
      return { color: explicitColor ?? 'neutral', variant: 'soft' as const }
  }
}

const badgeClass = computed(() => {
  switch (props.kind) {
    case 'status':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    case 'tag':
      return 'rounded-lg font-semibold tracking-[0.02em]'
    case 'outline':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    case 'info':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    case 'role':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    case 'price':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    case 'accent':
      return 'rounded-full font-mono uppercase tracking-[0.14em]'
    default:
      return 'rounded-full'
  }
})

const resolved = computed(() => {
  const defaults = resolveDefaults(props.kind, props.color)
  const color: BadgeColor = props.color ?? defaults.color

  return {
    color,
    variant: defaults.variant,
  }
})

const toneClass = computed(() => {
  const colors: Record<BadgeColor, string> = {
    primary: 'border-lavender/42 bg-lavender/16 text-lavender',
    secondary: 'border-secondary/42 bg-secondary/16 text-secondary',
    success: 'border-success/42 bg-success/16 text-success',
    info: 'border-info/42 bg-info/16 text-info',
    warning: 'border-warning/42 bg-warning/16 text-warning',
    error: 'border-error/42 bg-error/16 text-error',
    neutral: 'border-default/62 bg-elevated/46 text-toned',
  }

  const variants: Record<BadgeVariant, string> = {
    soft: 'backdrop-blur-xs shadow-sm',
    subtle: 'backdrop-blur-[1px] shadow-none',
    outline: 'bg-transparent shadow-none',
  }

  const sizeClass: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
    xl: 'px-4.5 py-2 text-sm',
  }

  return [colors[resolved.value.color], variants[resolved.value.variant], sizeClass[props.size], badgeClass.value]
})
</script>

<template>
  <span
    v-bind="attrs"
    class="inline-flex items-center gap-2 border leading-none whitespace-nowrap ring-1 ring-inset ring-white/10 transition-colors duration-200" :class="[toneClass]"
  >
    <BaseIcon v-if="icon && leading !== false" :name="icon" class="size-4" aria-hidden="true" />
    <slot />
    <BaseIcon v-if="icon && leading === false" :name="icon" class="size-4" aria-hidden="true" />
  </span>
</template>

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
      return 'rounded-full px-2.5 font-medium'
    case 'tag':
      return 'rounded-md px-2.5 py-1 text-xs font-semibold'
    case 'outline':
      return 'rounded-full px-2.5'
    case 'info':
      return 'rounded-full px-2.5'
    case 'role':
      return 'rounded-full px-2 font-semibold'
    case 'price':
      return 'rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase md:text-sm'
    case 'accent':
      return 'rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase'
    default:
      return 'rounded-full px-2.5'
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
    primary: 'border-primary/20 bg-primary/12 text-primary',
    secondary: 'border-secondary/20 bg-secondary/12 text-secondary',
    success: 'border-success/20 bg-success/12 text-success',
    info: 'border-info/20 bg-info/12 text-info',
    warning: 'border-warning/20 bg-warning/12 text-warning',
    error: 'border-error/20 bg-error/12 text-error',
    neutral: 'border-default/55 bg-default/40 text-toned',
  }

  const variants: Record<BadgeVariant, string> = {
    soft: 'shadow-sm',
    subtle: 'shadow-none',
    outline: 'bg-transparent',
  }

  const sizeClass: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
    xs: 'px-2 py-0.5 text-[0.7rem]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-sm',
    xl: 'px-4 py-1.5 text-base',
  }

  return [colors[resolved.value.color], variants[resolved.value.variant], sizeClass[props.size], badgeClass.value]
})
</script>

<template>
  <span
    v-bind="attrs"
    :class="['inline-flex items-center gap-1 border text-xs leading-none', toneClass]"
  >
    <BaseIcon v-if="icon && leading !== false" :name="icon" class="size-3.5" aria-hidden="true" />
    <slot />
    <BaseIcon v-if="icon && leading === false" :name="icon" class="size-3.5" aria-hidden="true" />
  </span>
</template>

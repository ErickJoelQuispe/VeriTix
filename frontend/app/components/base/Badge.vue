<script setup lang="ts">
/**
 * BaseBadge — semantic wrapper around UBadge.
 *
 * Kinds:
 *   status  → dynamic color (success/warning/error/neutral) + soft variant + pill shape
 *            Used for entity statuses (Activo/Inactivo, PUBLISHED/DRAFT/etc.)
 *   tag     → neutral color + subtle variant + rounded-md shape
 *            Used for categorisation labels (genres, formats)
 *   outline → neutral/warning color + outline variant + pill shape
 *            Used for secondary tags (Revisión, +N overflow, alert counts)
 *   info    → neutral color + soft variant + pill shape
 *            Used for contextual info (pagination, counts)
 *   role    → primary color + soft variant + pill shape
 *            Used for role indicators (ADMIN)
 *   price   → primary color + soft variant + larger pill shape
 *            Used for price displays
 *   accent  → dynamic color/variant + pill shape with icon
 *            Used for highlighted callouts (SettingsShell badges)
 */

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
</script>

<template>
  <UBadge
    v-bind="attrs"
    :color="resolved.color"
    :variant="resolved.variant"
    :size="size"
    :icon="icon"
    :leading="leading"
    :class="badgeClass"
  >
    <slot />
  </UBadge>
</template>

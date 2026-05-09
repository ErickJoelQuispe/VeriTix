<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: ButtonVariant
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    block?: boolean
    loading?: boolean
    disabled?: boolean
    leadingIcon?: string
    trailingIcon?: string
  }>(),
  {
    label: '',
    variant: 'primary',
    type: 'button',
    size: 'lg',
    block: false,
    loading: false,
    disabled: false,
    leadingIcon: undefined,
    trailingIcon: undefined,
    to: undefined,
    href: undefined,
  },
)

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'reversed' | 'warning' | 'danger'

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, disabled: _disabled, ...rest } = attrs
  return rest
})

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClass = computed(() => {
  const sizeClass = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
    xl: 'px-6 py-3.5 text-sm',
  }[props.size]

  const sharedClass = 'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border font-medium uppercase leading-none tracking-wide transition-all duration-200 before:absolute before:-inset-x-1 before:-inset-y-1 before:content-[""] focus-visible:outline-none focus-visible:ring-2 active:translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60'

  const variantClass: Record<ButtonVariant, string> = {
    primary: 'border-highlighted bg-highlighted text-default shadow-sm focus-visible:ring-highlighted/30 hover:-translate-y-0.5 hover:border-lavender hover:bg-lavender hover:text-white hover:font-semibold hover:shadow-[0_14px_28px_-18px_rgba(62,21,120,0.6)]',
    secondary: 'border-default/70 bg-elevated text-highlighted ring-1 ring-inset ring-white/10 shadow-[0_8px_20px_-16px_rgba(120,108,158,0.45)] focus-visible:ring-lavender/35 hover:-translate-y-0.5 hover:border-lavender/45 hover:bg-[color-mix(in_oklch,var(--color-lavender)_18%,var(--color-elevated))] hover:text-white hover:shadow-[0_12px_24px_-16px_rgba(86,29,164,0.35)]',
    outlined: 'border-border-accented bg-transparent text-toned shadow-none focus-visible:ring-primary/25 hover:-translate-y-0.5 hover:border-lavender/40 hover:bg-[color-mix(in_oklch,var(--color-lavender)_10%,transparent)] hover:text-highlighted',
    reversed: 'border-accent/45 bg-accent text-default ring-1 ring-inset ring-white/8 shadow-sm focus-visible:ring-accent/35 hover:-translate-y-1 hover:border-accent/95 hover:bg-[color-mix(in_oklch,var(--color-accent)_82%,black)] hover:shadow-[0_16px_34px_-18px_rgba(166,102,255,0.72)]',
    warning: 'border-warning/60 bg-warning text-default ring-1 ring-inset ring-white/8 shadow-sm focus-visible:ring-warning/35 hover:-translate-y-1 hover:border-warning/95 hover:bg-[color-mix(in_oklch,var(--color-warning)_82%,black)] hover:shadow-[0_16px_32px_-18px_rgba(245,158,11,0.72)]',
    danger: 'border-error/60 bg-error text-default ring-1 ring-inset ring-white/8 shadow-sm focus-visible:ring-error/35 hover:-translate-y-1 hover:border-error/95 hover:bg-[color-mix(in_oklch,var(--color-error)_84%,black)] hover:shadow-[0_16px_32px_-18px_rgba(236,104,92,0.74)]',
  }

  return [sharedClass, sizeClass, variantClass[props.variant], attrs.class]
})
</script>

<template>
  <NuxtLink
    v-if="to"
    v-bind="forwardedAttrs"
    :to="to"
    :class="[buttonClass, block ? 'w-full' : '', isDisabled ? 'pointer-events-none opacity-60' : '']"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :tabindex="isDisabled ? -1 : undefined"
  >
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" class="size-4" aria-hidden="true" />
    <span v-if="loading" class="inline-flex size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
    <slot>{{ label }}</slot>
    <BaseIcon v-if="trailingIcon" :name="trailingIcon" class="size-4" aria-hidden="true" />
  </NuxtLink>

  <a
    v-else-if="href"
    v-bind="forwardedAttrs"
    :href="href"
    :class="[buttonClass, block ? 'w-full' : '', isDisabled ? 'pointer-events-none opacity-60' : '']"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :tabindex="isDisabled ? -1 : undefined"
  >
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" class="size-4" aria-hidden="true" />
    <span v-if="loading" class="inline-flex size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
    <slot>{{ label }}</slot>
    <BaseIcon v-if="trailingIcon" :name="trailingIcon" class="size-4" aria-hidden="true" />
  </a>

  <button
    v-else
    v-bind="forwardedAttrs"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :class="[buttonClass, block ? 'w-full' : '']"
  >
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" class="size-4" aria-hidden="true" />
    <span v-if="loading" class="inline-flex size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
    <slot>{{ label }}</slot>
    <BaseIcon v-if="trailingIcon" :name="trailingIcon" class="size-4" aria-hidden="true" />
  </button>
</template>

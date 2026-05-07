<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: ButtonVariant
    kind?: ButtonKind
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
    variant: undefined,
    kind: 'primary',
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

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'reversed'
type ButtonKind = 'primary' | 'secondary' | 'tertiary'

const kindToVariant: Record<ButtonKind, ButtonVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'outlined',
}

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, disabled: _disabled, ...rest } = attrs
  return rest
})

const isDisabled = computed(() => props.disabled || props.loading)

const effectiveVariant = computed<ButtonVariant>(() => props.variant ?? kindToVariant[props.kind])

const buttonClass = computed(() => {
  const sizeClass = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
    xl: 'px-6 py-3.5 text-sm',
  }[props.size]

  const sharedClass = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border font-medium uppercase leading-none tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 active:translate-y-px active:scale-[0.99] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60'

  const variantClass: Record<ButtonVariant, string> = {
    primary: 'border-highlighted bg-highlighted text-default shadow-sm focus-visible:ring-highlighted/30 hover:-translate-y-0.5 hover:border-lavender hover:bg-lavender hover:text-white hover:font-semibold hover:shadow-[0_14px_28px_-18px_rgba(62,21,120,0.6)]',
    secondary: 'border-default/55 bg-elevated/84 text-highlighted shadow-none focus-visible:ring-default/35 hover:-translate-y-0.5 hover:border-lavender/35 hover:bg-[color-mix(in_oklch,var(--color-lavender)_14%,var(--color-elevated))] hover:text-white hover:shadow-[0_10px_22px_-18px_rgba(86,29,164,0.22)]',
    outlined: 'border-border-accented bg-transparent text-toned shadow-none focus-visible:ring-primary/25 hover:-translate-y-0.5 hover:border-lavender/40 hover:bg-[color-mix(in_oklch,var(--color-lavender)_10%,transparent)] hover:text-highlighted',
    reversed: 'border-accent/40 bg-accent text-default shadow-sm focus-visible:ring-accent/30 hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent/90 hover:shadow-[0_14px_30px_-18px_rgba(166,102,255,0.6)]',
  }

  return [sharedClass, sizeClass, variantClass[effectiveVariant.value], attrs.class]
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

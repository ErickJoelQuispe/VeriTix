<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    label?: string
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

type ButtonKind = 'primary' | 'secondary' | 'tertiary'

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, disabled: _disabled, ...rest } = attrs
  return rest
})

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClass = computed(() => {
  const sizeClass = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4.5 py-3 text-base',
    xl: 'px-5 py-3.5 text-base',
  }[props.size]

  const sharedClass = 'inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60'

  const kindClass: Record<ButtonKind, string> = {
    primary: 'border-primary/55 bg-primary/18 text-highlighted shadow-sm focus-visible:ring-primary/35 hover:-translate-y-px hover:border-primary/70 hover:bg-primary/26',
    secondary: 'border-default/60 bg-default/40 text-toned shadow-none focus-visible:ring-secondary/30 hover:-translate-y-px hover:border-secondary/28 hover:bg-secondary/12 hover:text-highlighted',
    tertiary: 'border-transparent bg-transparent text-toned shadow-none focus-visible:ring-primary/25 hover:border-default/55 hover:bg-default/10 hover:text-highlighted',
  }

  return [sharedClass, sizeClass, kindClass[props.kind], attrs.class]
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

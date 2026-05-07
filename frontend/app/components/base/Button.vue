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
  const { class: _class, ...rest } = attrs
  return rest
})

const buttonClass = computed(() => {
  const sharedClass = 'justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2'

  const kindClass: Record<ButtonKind, string> = {
    primary: 'border-primary/55 bg-primary/18 text-highlighted shadow-sm focus-visible:ring-primary/35 hover:-translate-y-px hover:border-primary/70 hover:bg-primary/26',
    secondary: 'border-default/60 bg-default/40 text-toned shadow-none focus-visible:ring-secondary/30 hover:-translate-y-px hover:border-secondary/28 hover:bg-secondary/12 hover:text-highlighted',
    tertiary: 'border-transparent bg-transparent text-toned shadow-none focus-visible:ring-primary/25 hover:border-default/55 hover:bg-default/10 hover:text-highlighted',
  }

  return [sharedClass, kindClass[props.kind], attrs.class]
})

const buttonColor = computed(() => {
  if (props.kind === 'primary') {
    return 'primary'
  }

  if (props.kind === 'secondary') {
    return 'secondary'
  }

  return 'neutral'
})

const buttonVariant = computed(() => {
  if (props.kind === 'primary') {
    return 'solid'
  }

  if (props.kind === 'secondary') {
    return 'soft'
  }

  return 'ghost'
})
</script>

<template>
  <UButton
    v-bind="forwardedAttrs"
    :to="to"
    :href="href"
    :type="type"
    :size="size"
    :block="block"
    :loading="loading"
    :disabled="disabled"
    :leading-icon="leadingIcon"
    :trailing-icon="trailingIcon"
    :color="buttonColor"
    :variant="buttonVariant"
    :class="buttonClass"
  >
    <slot>
      {{ label }}
    </slot>
  </UButton>
</template>

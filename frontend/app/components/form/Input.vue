<script setup lang="ts">
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  color?: InputColor
  variant?: InputVariant
  size?: InputSize
  type?: string
  disabled?: boolean
  placeholder?: string
  icon?: string
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  type: 'text',
  disabled: false,
  placeholder: '',
  icon: undefined,
})
type InputColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type InputVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()
const slots = useSlots()
const formContext = useFormContext()
const fieldName = computed(() => typeof attrs.name === 'string' ? attrs.name : '')

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const inputClass = computed(() => {
  const sizeClass = {
    xs: 'min-h-8 px-3 py-1.5 text-xs',
    sm: 'min-h-9 px-3.5 py-2 text-sm',
    md: 'min-h-10 px-4 py-2.5 text-sm',
    lg: 'min-h-11 px-4.5 py-3 text-base',
    xl: 'min-h-12 px-5 py-3.5 text-base',
  }[props.size]

  const variantClass = {
    outline: 'border border-default/60 bg-default/20 shadow-sm',
    soft: 'border border-default/55 bg-elevated/45 shadow-sm',
    subtle: 'border border-default/55 bg-default/30 shadow-sm',
    ghost: 'border border-transparent bg-transparent shadow-none',
    none: 'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
  }[props.variant]

  const hasLeading = Boolean(props.icon || slots.leading)
  const hasTrailing = Boolean(slots.trailing)

  return [
    'w-full rounded-xl text-highlighted placeholder:text-toned/70 transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    sizeClass,
    variantClass,
    stateClass.value,
    hasLeading && props.variant !== 'none' ? 'pl-11' : '',
    hasTrailing && props.variant !== 'none' ? 'pr-11' : '',
    attrs.class,
  ]
})

const hasLeading = computed(() => Boolean(props.icon || slots.leading))
const hasTrailing = computed(() => Boolean(slots.trailing))

const errorMessage = computed(() => {
  if (!fieldName.value) {
    return ''
  }

  return formContext?.errors[fieldName.value] ?? ''
})

const hasError = computed(() => Boolean(errorMessage.value))

const stateClass = computed(() => {
  if (props.variant === 'none') {
    return ''
  }

  if (hasError.value) {
    return 'border-error/70 ring-2 ring-error/20'
  }

  return 'focus-visible:border-lavender/45 focus-visible:ring-2 focus-visible:ring-lavender/30'
})

watch(modelValue, () => {
  if (fieldName.value && formContext) {
    formContext.clearError(fieldName.value)
  }
})
</script>

<template>
  <div class="relative w-full">
    <BaseIcon v-if="hasLeading && props.icon" :name="props.icon" class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-toned" aria-hidden="true" />
    <div v-else-if="hasLeading" class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-toned">
      <slot name="leading" />
    </div>

    <input
      v-model="modelValue"
      v-bind="forwardedAttrs"
      :type="props.type"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :class="inputClass"
      :aria-invalid="errorMessage ? 'true' : undefined"
    >

    <div v-if="hasTrailing" class="absolute inset-y-0 right-4 flex items-center text-toned">
      <slot name="trailing" />
    </div>
  </div>
</template>

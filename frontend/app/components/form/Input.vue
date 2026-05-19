<script setup lang="ts">
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  label?: string
  help?: string
  required?: boolean
  variant?: InputVariant
  size?: InputSize
  type?: string
  disabled?: boolean
  placeholder?: string
  icon?: string
}>(), {
  label: '',
  help: '',
  required: false,
  variant: 'subtle',
  size: 'lg',
  type: 'text',
  disabled: false,
  placeholder: '',
  icon: undefined,
})
type InputVariant = 'subtle' | 'hero'
type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()
const slots = useSlots()
const formContext = useFormContext()
const fieldClass = computed(() => attrs.class)
const fieldName = computed(() => typeof attrs.name === 'string' ? attrs.name : '')

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => {
  if (!fieldName.value) {
    return ''
  }

  return formContext?.errors[fieldName.value] ?? ''
})

const helpId = computed(() => `${fieldName.value || 'input'}-help`)
const errorId = computed(() => `${fieldName.value || 'input'}-error`)

const describedBy = computed(() => {
  if (errorMessage.value) {
    return errorId.value
  }

  if (props.help) {
    return helpId.value
  }

  return undefined
})

const hasError = computed(() => Boolean(errorMessage.value))

const stateClass = computed(() => {
  if (hasError.value) {
    return 'border-error/70 ring-2 ring-error/20'
  }

  return 'focus-visible:border-lavender/45 focus-visible:ring-2 focus-visible:ring-lavender/30'
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
    subtle: 'border border-default/55 bg-default/30 shadow-sm',
    hero: 'rounded-full border border-default/50 bg-linear-to-br from-white/10 to-white/5 shadow-lg backdrop-blur-sm',
  }[props.variant]

  const hasLeading = Boolean(props.icon || slots.leading)
  const hasTrailing = Boolean(slots.trailing)

  const leadingPaddingClass = hasLeading
    ? props.variant === 'hero'
      ? 'pl-12'
      : 'pl-11'
    : ''

  const trailingPaddingClass = hasTrailing
    ? props.variant === 'hero'
      ? 'pr-32 sm:pr-36'
      : 'pr-11'
    : ''

  return [
    'w-full rounded-xl text-highlighted placeholder:text-toned/70 transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    sizeClass,
    variantClass,
    stateClass.value,
    leadingPaddingClass,
    trailingPaddingClass,
  ]
})

const hasLeading = computed(() => Boolean(props.icon || slots.leading))
const hasTrailing = computed(() => Boolean(slots.trailing))

const leadingClass = computed(() => {
  return props.variant === 'hero'
    ? 'pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-white/90 transition-colors duration-300'
    : 'pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/90'
})

const leadingSlotClass = computed(() => {
  return props.variant === 'hero'
    ? 'pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-white/90'
    : 'pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/90'
})

const trailingClass = computed(() => {
  return props.variant === 'hero'
    ? 'absolute inset-y-0 right-2 flex items-center'
    : 'absolute inset-y-0 right-4 flex items-center text-white/80'
})

watch(modelValue, () => {
  if (fieldName.value && formContext) {
    formContext.clearError(fieldName.value)
  }
})
</script>

<template>
  <div v-if="props.label" class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <div class="relative w-full">
      <BaseIcon v-if="hasLeading && props.icon" :name="props.icon" :class="leadingClass" aria-hidden="true" />
      <div v-else-if="hasLeading" :class="leadingSlotClass">
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
        :aria-describedby="describedBy"
        :aria-errormessage="errorMessage ? errorId : undefined"
      >

      <div v-if="hasTrailing" :class="trailingClass">
        <slot name="trailing" />
      </div>
    </div>

    <p v-if="errorMessage" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </div>

  <div v-else class="relative w-full" :class="[fieldClass]">
    <BaseIcon v-if="hasLeading && props.icon" :name="props.icon" :class="leadingClass" aria-hidden="true" />
    <div v-else-if="hasLeading" :class="leadingSlotClass">
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

    <div v-if="hasTrailing" :class="trailingClass">
      <slot name="trailing" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  name?: string
  label?: string
  help?: string
  required?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rows?: number
}>(), {
  name: '',
  label: '',
  help: '',
  required: false,
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  rows: 5,
})

const modelValue = defineModel<string | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => {
  if (!props.name) {
    return ''
  }

  return formContext?.errors[props.name] ?? ''
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

const textareaClass = computed(() => {
  const sizeClass = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4.5 py-3 text-base',
    xl: 'px-5 py-3.5 text-base',
  }[props.size]

  const variantClass = {
    outline: 'border border-default/60 bg-default/20 shadow-sm',
    soft: 'border border-default/55 bg-elevated/45 shadow-sm',
    subtle: 'border border-default/55 bg-default/30 shadow-sm',
    ghost: 'border border-transparent bg-transparent shadow-none',
    none: 'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
  }[props.variant]

  return [
    'w-full rounded-xl text-highlighted placeholder:text-toned/70 transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    sizeClass,
    variantClass,
    stateClass.value,
    attrs.class,
  ]
})

watch(modelValue, () => {
  if (props.name) {
    formContext?.clearError(props.name)
  }
})
</script>

<template>
  <div v-if="props.label" class="space-y-2">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <textarea
      v-model="modelValue"
      v-bind="forwardedAttrs"
      :name="props.name || undefined"
      :rows="props.rows"
      :required="props.required"
      :class="textareaClass"
      :aria-invalid="errorMessage ? 'true' : undefined"
    />

    <p v-if="props.help && !errorMessage" class="text-xs text-toned">
      {{ props.help }}
    </p>

    <p v-if="errorMessage" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>

  <textarea
    v-else
    v-model="modelValue"
    v-bind="forwardedAttrs"
    :name="props.name || undefined"
    :rows="props.rows"
    :required="props.required"
    :class="textareaClass"
    :aria-invalid="errorMessage ? 'true' : undefined"
  />
</template>

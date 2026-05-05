<script setup lang="ts">
import { useFormContext } from './context'

type SelectColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type SelectVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: Array<{ label: string, value: string | number, disabled?: boolean }>
  label: string
  name: string
  help?: string
  required?: boolean
  color?: SelectColor
  variant?: SelectVariant
  size?: SelectSize
  disabled?: boolean
  placeholder?: string
  multiple?: boolean
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  disabled: false,
  placeholder: '',
  help: '',
  required: false,
  multiple: false,
})

const modelValue = defineModel<string | number | Array<string | number> | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()

const fieldClass = computed(() => attrs.class)
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => {
  return formContext?.errors[props.name] ?? ''
})

const selectClass = computed(() => {
  const sizeClass = {
    xs: 'min-h-8 px-3 py-1.5 text-xs',
    sm: 'min-h-9 px-3.5 py-2 text-sm',
    md: 'min-h-10 px-4 py-2.5 text-sm',
    lg: 'min-h-11 px-4.5 py-3 text-base',
    xl: 'min-h-12 px-5 py-3.5 text-base',
  }[props.size]

  const variantClass = {
    outline: 'border border-default/60 bg-default/20 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35',
    soft: 'border border-default/55 bg-elevated/45 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35',
    subtle: 'border border-default/55 bg-default/30 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35',
    ghost: 'border border-transparent bg-transparent shadow-none focus-visible:ring-2 focus-visible:ring-primary/25',
    none: 'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
  }[props.variant]

  return [
    'w-full rounded-xl text-highlighted transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
    sizeClass,
    variantClass,
  ]
})

function resolveValue(rawValue: string): string | number {
  const match = props.items.find(item => String(item.value) === rawValue)
  return match?.value ?? rawValue
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement

  if (props.multiple) {
    modelValue.value = Array.from(target.selectedOptions).map(option => resolveValue(option.value))
  }
  else {
    modelValue.value = resolveValue(target.value)
  }

  formContext?.clearError(props.name)
}
</script>

<template>
  <label :class="['space-y-2', fieldClass]">
    <span class="flex items-center gap-2 text-sm font-medium text-highlighted">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </span>

    <select
      :value="props.multiple ? undefined : (modelValue ?? '')"
      v-bind="forwardedAttrs"
      :name="props.name"
      :multiple="props.multiple"
      :required="props.required"
      :disabled="props.disabled"
      :class="selectClass"
      @change="handleChange"
    >
      <option v-if="props.placeholder && !props.multiple" value="" disabled>
        {{ props.placeholder }}
      </option>
      <option
        v-for="item in props.items"
        :key="String(item.value)"
        :value="String(item.value)"
        :disabled="item.disabled"
        :selected="Array.isArray(modelValue) ? modelValue.map(String).includes(String(item.value)) : String(modelValue ?? '') === String(item.value)"
      >
        {{ item.label }}
      </option>
    </select>

    <p v-if="errorMessage" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

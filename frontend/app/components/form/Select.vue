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
  placeholderValue?: string | number
  icon?: string
  multiple?: boolean
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  disabled: false,
  placeholder: '',
  placeholderValue: undefined,
  icon: undefined,
  help: '',
  required: false,
  multiple: false,
})

const modelValue = defineModel<string | number | Array<string | number> | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()
const isOpen = ref(false)
const listboxId = `select-listbox-${Math.random().toString(36).slice(2, 10)}`
const triggerRef = ref<HTMLButtonElement>()
const rootRef = ref<HTMLElement>()

const fieldClass = computed(() => attrs.class)
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => {
  return formContext?.errors[props.name] ?? ''
})

const selectedItem = computed(() => {
  if (props.multiple) {
    return null
  }

  const selectedValue = String(modelValue.value ?? '')
  return props.items.find(item => String(item.value) === selectedValue) ?? null
})

const hasLeading = computed(() => Boolean(props.icon))

const displayLabel = computed(() => {
  return selectedItem.value?.label ?? props.placeholder
})

const triggerLabelClass = computed(() => {
  if (!selectedItem.value) {
    return 'text-toned/70'
  }

  if (props.placeholderValue !== undefined && String(selectedItem.value.value) === String(props.placeholderValue)) {
    return 'text-toned/70'
  }

  return 'text-highlighted'
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

const selectClass = computed(() => {
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

  return [
    'relative w-full appearance-none rounded-xl text-left text-highlighted transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    sizeClass,
    variantClass,
    stateClass.value,
    hasLeading.value && props.variant !== 'none' ? 'pl-11' : '',
    props.variant !== 'none' ? 'pr-11' : '',
    attrs.class,
  ]
})

const openClass = computed(() => {
  if (props.variant === 'none' || !isOpen.value || hasError.value) {
    return ''
  }

  return 'border-lavender/45 ring-2 ring-lavender/20'
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

function toggleListbox() {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value
}

function selectItem(value: string | number) {
  modelValue.value = value
  isOpen.value = false
  formContext?.clearError(props.name)
}

function closeListbox() {
  isOpen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeListbox()
    triggerRef.value?.focus()
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (!isOpen.value) {
    return
  }

  const target = event.target as Node | null
  if (target && rootRef.value?.contains(target)) {
    return
  }

  closeListbox()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <div ref="rootRef" class="relative">
      <BaseIcon
        v-if="props.icon && props.variant !== 'none'"
        :name="props.icon"
        class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-toned"
        aria-hidden="true"
      />

      <select
        v-if="props.multiple"
        :value="props.multiple ? undefined : (modelValue ?? '')"
        v-bind="forwardedAttrs"
        :name="props.name"
        :multiple="props.multiple"
        :required="props.required"
        :disabled="props.disabled"
        :class="selectClass"
        :aria-invalid="errorMessage ? 'true' : undefined"
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

      <template v-else>
        <input
          type="hidden"
          :name="props.name"
          :value="selectedItem ? String(selectedItem.value) : ''"
        >

        <button
          ref="triggerRef"
          type="button"
          v-bind="forwardedAttrs"
          :disabled="props.disabled"
          :class="[selectClass, openClass]"
          :aria-invalid="errorMessage ? 'true' : undefined"
          aria-haspopup="listbox"
          :aria-expanded="isOpen ? 'true' : 'false'"
          :aria-controls="listboxId"
          @click="toggleListbox"
        >
          <BaseIcon
            v-if="props.icon"
            :name="props.icon"
            class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-toned"
            aria-hidden="true"
          />

          <span class="truncate" :class="triggerLabelClass">
            {{ displayLabel }}
          </span>
        </button>

        <div
          v-if="isOpen"
          :id="listboxId"
          role="listbox"
          class="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-lavender/35 bg-default shadow-[0_16px_34px_-24px_rgba(86,29,164,0.42)] ring-1 ring-lavender/20"
        >
          <button
            v-for="item in props.items"
            :key="String(item.value)"
            type="button"
            role="option"
            :disabled="item.disabled"
            :aria-selected="selectedItem && String(selectedItem.value) === String(item.value) ? 'true' : 'false'"
            class="relative block w-full bg-default/45 py-2.5 pl-4 pr-4 text-left text-sm text-highlighted transition-colors hover:bg-[color-mix(in_oklch,var(--color-lavender)_12%,var(--color-elevated))] hover:text-highlighted disabled:cursor-not-allowed disabled:opacity-50"
            :class="selectedItem && String(selectedItem.value) === String(item.value) ? 'bg-[color-mix(in_oklch,var(--color-lavender)_16%,var(--color-default))] font-medium text-highlighted ring-1 ring-inset ring-lavender/25 shadow-[inset_3px_0_0_var(--color-lavender)]' : ''"
            @click="selectItem(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </template>

      <BaseIcon
        v-if="!props.multiple && props.variant !== 'none'"
        name="i-lucide-chevron-down"
        class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-toned transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
        aria-hidden="true"
      />
    </div>

    <p v-if="errorMessage" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

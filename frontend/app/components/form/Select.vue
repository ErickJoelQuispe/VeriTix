<script setup lang="ts">
import { useFormContext } from './context'

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
  size?: SelectSize
  disabled?: boolean
  placeholder?: string
  placeholderValue?: string | number
  icon?: string
  multiple?: boolean
}>(), {
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

const helpId = computed(() => `${props.name}-help`)
const errorId = computed(() => `${props.name}-error`)

const describedBy = computed(() => {
  if (errorMessage.value) {
    return errorId.value
  }

  if (props.help) {
    return helpId.value
  }

  return undefined
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

const controlClass = computed(() => {
  return [
    'flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/20 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/35 hover:bg-default/30 focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20 disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    hasError.value ? 'border-error/70 ring-2 ring-error/20 hover:border-error/70 hover:bg-default/20 focus-visible:border-error/70 focus-visible:ring-error/20' : '',
    hasLeading.value ? 'pl-11' : '',
    'pr-11',
    attrs.class,
  ]
})

const panelClass = computed(() => {
  return 'absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg'
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
        v-if="props.icon"
        :name="props.icon"
        class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-lavender/80"
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
        :class="controlClass"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="errorMessage ? errorId : undefined"
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
          :class="controlClass"
          :aria-invalid="errorMessage ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-errormessage="errorMessage ? errorId : undefined"
          aria-haspopup="listbox"
          :aria-expanded="isOpen ? 'true' : 'false'"
          :aria-controls="listboxId"
          @click="toggleListbox"
        >
          <BaseIcon
            v-if="props.icon"
            :name="props.icon"
            class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-lavender/80"
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
          :class="panelClass"
        >
          <button
            v-for="item in props.items"
            :key="String(item.value)"
            type="button"
            role="option"
            :disabled="item.disabled"
            :aria-selected="selectedItem && String(selectedItem.value) === String(item.value) ? 'true' : 'false'"
            class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender disabled:cursor-not-allowed disabled:opacity-50"
            :class="selectedItem && String(selectedItem.value) === String(item.value) ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
            @click="selectItem(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </template>

      <BaseIcon
        v-if="!props.multiple"
        name="i-lucide-chevron-down"
        class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-lavender/70 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
        aria-hidden="true"
      />
    </div>

    <p v-if="errorMessage" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

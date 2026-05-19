<script setup lang="ts">
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: Array<{ label: string, value: string | number }>
  label: string
  name: string
  help?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  icon?: string
  noResultsText?: string
}>(), {
  help: '',
  required: false,
  disabled: false,
  placeholder: 'Buscá y seleccioná',
  icon: undefined,
  noResultsText: 'Sin resultados',
})

const NORMALIZE_REGEX = /[\u0300-\u036F]/g

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()
const formContext = useFormContext()
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const listboxId = `autocomplete-listbox-${Math.random().toString(36).slice(2, 10)}`
const inputId = `autocomplete-input-${Math.random().toString(36).slice(2, 10)}`

const fieldClass = computed(() => attrs.class)
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => formContext?.errors[props.name] ?? '')
const hasError = computed(() => Boolean(errorMessage.value))

const helpId = computed(() => `${props.name}-help`)
const errorId = computed(() => `${props.name}-error`)

const describedBy = computed(() => {
  if (hasError.value) {
    return errorId.value
  }

  if (props.help) {
    return helpId.value
  }

  return undefined
})

const selectedItem = computed(() => {
  const val = modelValue.value
  if (val === undefined || val === '') {
    return null
  }

  return props.items.find(item => String(item.value) === String(val)) ?? null
})

const filteredItems = computed(() => {
  if (!query.value) {
    return props.items
  }

  const q = query.value.toLowerCase().normalize('NFD').replace(NORMALIZE_REGEX, '')

  return props.items.filter(item =>
    item.label.toLowerCase().normalize('NFD').replace(NORMALIZE_REGEX, '').includes(q),
  )
})

const showDropdown = computed(() => isOpen.value)

const wrapperClass = computed(() => {
  return [
    'flex min-h-10 w-full items-center rounded-xl border bg-default/30 text-sm text-highlighted shadow-sm transition-all duration-150',
    hasError.value ? 'border-error/70 ring-2 ring-error/20' : 'border-default/55 focus-within:border-lavender/55 focus-within:ring-2 focus-within:ring-lavender/35',
    props.disabled ? 'cursor-not-allowed border-default/40 bg-default/15 opacity-70' : '',
    props.icon ? 'pl-11' : 'pl-4',
    'pr-3',
  ]
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement

  query.value = target.value
  isOpen.value = true
  activeIndex.value = -1

  if (modelValue.value !== undefined) {
    modelValue.value = undefined
    formContext?.clearError(props.name)
  }
}

function selectItem(item: { label: string, value: string | number }) {
  modelValue.value = item.value
  query.value = ''
  isOpen.value = false
  activeIndex.value = -1
  formContext?.clearError(props.name)
  inputRef.value?.focus()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (!isOpen.value) {
      isOpen.value = true
      activeIndex.value = 0
      return
    }

    activeIndex.value = Math.min(activeIndex.value + 1, filteredItems.value.length - 1)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (activeIndex.value <= 0) {
      activeIndex.value = -1
      return
    }

    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  }
  else if (event.key === 'Enter' || event.key === 'Tab') {
    if (event.key === 'Enter' && isOpen.value && activeIndex.value >= 0 && activeIndex.value < filteredItems.value.length) {
      const item = filteredItems.value[activeIndex.value]

      if (item) {
        event.preventDefault()
        selectItem(item)
      }
    }
    else if (event.key === 'Enter') {
      isOpen.value = false
    }
  }
  else if (event.key === 'Escape') {
    isOpen.value = false
    activeIndex.value = -1
    inputRef.value?.focus()
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

  isOpen.value = false
  activeIndex.value = -1
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <div ref="rootRef" class="relative">
      <input
        type="hidden"
        :name="props.name"
        :value="modelValue ?? ''"
      >

      <BaseIcon
        v-if="props.icon"
        :name="props.icon"
        class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/60"
        aria-hidden="true"
      />

      <div :class="wrapperClass">
        <input
          :id="inputId"
          ref="inputRef"
          type="text"
          v-bind="forwardedAttrs"
          :value="isOpen || !selectedItem ? query : selectedItem.label"
          :placeholder="selectedItem && !isOpen ? selectedItem.label : props.placeholder"
          :disabled="props.disabled"
          :required="props.required"
          role="combobox"
          aria-haspopup="listbox"
          :aria-expanded="showDropdown ? 'true' : 'false'"
          :aria-controls="listboxId"
          :aria-activedescendant="activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined"
          :aria-invalid="hasError ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-errormessage="hasError ? errorId : undefined"
          class="min-w-0 flex-1 bg-transparent py-3 text-highlighted placeholder:text-toned/70 focus-visible:outline-none disabled:cursor-not-allowed"
          @input="onInput"
          @focus="isOpen = true"
          @keydown="handleKeydown"
        >

        <BaseIcon
          name="i-lucide-chevron-down"
          class="size-4 shrink-0 text-white/45 transition-transform"
          :class="showDropdown ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </div>

      <div
        v-if="showDropdown"
        :id="listboxId"
        role="listbox"
        class="absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
      >
        <p
          v-if="filteredItems.length === 0"
          class="px-3 py-3 text-center text-sm text-toned/60"
        >
          {{ props.noResultsText }}
        </p>

        <button
          v-for="(item, index) in filteredItems"
          :id="`${listboxId}-option-${index}`"
          :key="String(item.value)"
          type="button"
          role="option"
          :aria-selected="String(modelValue) === String(item.value) ? 'true' : 'false'"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition"
          :class="[
            activeIndex === index
              ? 'bg-lavender/15 text-lavender'
              : 'text-highlighted hover:bg-lavender/8 hover:text-lavender',
            String(modelValue) === String(item.value) ? 'bg-lavender/10 text-lavender' : '',
          ]"
          @mousedown.prevent="selectItem(item)"
          @mouseenter="activeIndex = index"
        >
          <span>{{ item.label }}</span>
          <BaseIcon
            v-if="String(modelValue) === String(item.value)"
            name="i-lucide-check"
            class="size-4 shrink-0"
          />
        </button>
      </div>
    </div>

    <p v-if="hasError" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

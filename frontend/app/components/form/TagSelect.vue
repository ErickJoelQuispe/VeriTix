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
}>(), {
  help: '',
  required: false,
  disabled: false,
  placeholder: 'Seleccioná opciones',
  icon: undefined,
})

const modelValue = defineModel<Array<string | number> | undefined>({ default: [] })
const attrs = useAttrs()
const formContext = useFormContext()
const isOpen = ref(false)
const listboxId = `tagselect-listbox-${Math.random().toString(36).slice(2, 10)}`
const triggerRef = ref<HTMLButtonElement>()
const rootRef = ref<HTMLElement>()

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

const selectedValues = computed(() => modelValue.value ?? [])
const hasSelection = computed(() => selectedValues.value.length > 0)

interface TagItem {
  value: string | number
  label: string
}

const selectedTags = computed<TagItem[]>(() => {
  return selectedValues.value.map((val) => {
    const item = props.items.find(i => String(i.value) === String(val))
    return { value: val, label: item?.label ?? String(val) }
  })
})

const unselectedItems = computed(() => {
  return props.items.filter(item => !selectedValues.value.some(v => String(v) === String(item.value)))
})

const triggerLabel = computed(() => {
  return hasSelection.value
    ? `${selectedValues.value.length} seleccionado${selectedValues.value.length > 1 ? 's' : ''}`
    : props.placeholder
})

const controlClass = computed(() => {
  return [
    'flex min-h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-default/55 bg-default/30 px-3 text-sm font-medium text-highlighted shadow-sm transition hover:border-lavender/45 hover:ring-2 hover:ring-lavender/30 focus-visible:border-lavender/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30 disabled:cursor-not-allowed disabled:border-default/40 disabled:bg-default/15 disabled:text-toned disabled:opacity-70',
    hasError.value ? 'border-error/70 ring-2 ring-error/20 hover:border-error/70 hover:bg-default/20 focus-visible:border-error/70 focus-visible:ring-error/20' : '',
    isOpen.value ? 'border-lavender/45 ring-2 ring-lavender/30' : '',
    props.icon ? 'pl-11' : '',
    hasSelection.value ? 'text-highlighted' : 'text-toned/70',
    'pr-11',
  ]
})

const panelClass = 'absolute left-0 top-full z-10 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg'

function toggleOpen() {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value
}

function closeOpen() {
  isOpen.value = false
}

function addItem(value: string | number) {
  const current = [...selectedValues.value]

  if (!current.some(v => String(v) === String(value))) {
    current.push(value)
    modelValue.value = current
  }

  formContext?.clearError(props.name)
}

function removeItem(value: string | number) {
  modelValue.value = selectedValues.value.filter(v => String(v) !== String(value))
  formContext?.clearError(props.name)
}

function selectItem(value: string | number) {
  addItem(value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeOpen()
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

  closeOpen()
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
      <input
        type="hidden"
        :name="props.name"
        :value="selectedValues.join(',')"
      >

      <BaseIcon
        v-if="props.icon"
        :name="props.icon"
        class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/60 opacity-75"
        aria-hidden="true"
      />

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
        @click="toggleOpen"
      >
        <span class="truncate">
          {{ triggerLabel }}
        </span>
      </button>

      <BaseIcon
        name="i-lucide-chevron-down"
        class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/45 opacity-75 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
        aria-hidden="true"
      />

      <div
        v-if="isOpen"
        :id="listboxId"
        role="listbox"
        :class="panelClass"
      >
        <p
          v-if="unselectedItems.length === 0"
          class="px-3 py-3 text-center text-sm text-toned/60"
        >
          No hay más opciones disponibles
        </p>

        <button
          v-for="item in unselectedItems"
          :key="String(item.value)"
          type="button"
          role="option"
          class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
          :class="selectedValues.some(v => String(v) === String(item.value)) ? 'bg-lavender/10 text-lavender' : 'text-highlighted'"
          @click="selectItem(item.value)"
        >
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="hasSelection"
      class="flex flex-wrap gap-1.5 pt-1"
    >
      <span
        v-for="tag in selectedTags"
        :key="String(tag.value)"
        class="inline-flex items-center gap-1 rounded-xl border border-lavender/20 bg-lavender/10 px-2.5 py-1 text-xs font-medium text-lavender"
      >
        <span>{{ tag.label }}</span>
        <button
          type="button"
          class="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-lavender/20"
          :aria-label="`Eliminar ${tag.label}`"
          @click="removeItem(tag.value)"
        >
          <BaseIcon name="i-lucide-x" class="size-3" />
        </button>
      </span>
    </div>

    <p v-if="errorMessage" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

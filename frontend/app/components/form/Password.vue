<script setup lang="ts">
import { useFormContext } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    name: string
    label: string
    help?: string
    required?: boolean
    placeholder?: string
    icon?: string
    show?: boolean
  }>(),
  {
    help: undefined,
    required: false,
    placeholder: '',
    icon: 'i-lucide-lock',
    show: undefined,
  },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const modelValue = defineModel<string | number | undefined>()
const internalShow = ref(false)
const attrs = useAttrs()
const formContext = useFormContext()

const fieldClass = computed(() => attrs.class)

const forwardedInputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const errorMessage = computed(() => {
  return formContext?.errors[props.name] ?? ''
})

const isVisible = computed({
  get() {
    return props.show ?? internalShow.value
  },
  set(value: boolean) {
    if (props.show === undefined) {
      internalShow.value = value
    }

    emit('update:show', value)
  },
})

const inputType = computed(() => {
  if (isVisible.value) {
    return 'text'
  }

  return 'password'
})

function toggleVisibility() {
  isVisible.value = !isVisible.value
}

watch(modelValue, () => {
  formContext?.clearError(props.name)
})
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <UiMetaLabel as="span">
      {{ props.label }}
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </UiMetaLabel>

    <FormInput
      v-model="modelValue"
      v-bind="forwardedInputAttrs"
      :name="props.name"
      :type="inputType"
      :placeholder="props.placeholder"
      :icon="props.icon"
      :required="props.required"
    >
      <template #trailing>
        <button
          type="button"
          :aria-label="isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="isVisible"
          class="cursor-pointer rounded-md p-0.5 text-muted transition-colors duration-150 hover:bg-white/6 hover:text-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
          @click="toggleVisibility"
        >
          <BaseIcon
            :name="isVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            class="size-5"
          />
        </button>
      </template>
    </FormInput>

    <p v-if="props.help && !errorMessage" class="text-xs text-toned">
      {{ props.help }}
    </p>

    <p v-if="errorMessage" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>
  </label>
</template>

<script setup lang="ts">
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

const fieldClass = computed(() => attrs.class)

const forwardedInputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
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
</script>

<template>
  <UFormField
    :name="props.name"
    :label="props.label"
    :help="props.help"
    :required="props.required"
    :class="fieldClass"
  >
    <BaseFormInput
      v-model="modelValue"
      v-bind="forwardedInputAttrs"
      :type="inputType"
      :placeholder="props.placeholder"
      :icon="props.icon"
    >
      <template #trailing>
        <button
          type="button"
          :aria-label="isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="isVisible"
          class="cursor-pointer rounded-md p-0.5 text-muted transition-colors duration-150 hover:bg-white/6 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          @click="toggleVisibility"
        >
          <UIcon
            :name="isVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            class="size-5"
          />
        </button>
      </template>
    </BaseFormInput>
  </UFormField>
</template>

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
    type?: string
    placeholder?: string
    icon?: string
  }>(),
  {
    help: undefined,
    required: false,
    type: 'text',
    placeholder: '',
    icon: undefined,
  },
)

const modelValue = defineModel<string | number | undefined>()
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

watch(modelValue, () => {
  formContext?.clearError(props.name)
})
</script>

<template>
  <label class="space-y-2" :class="[fieldClass]">
    <span class="flex items-center gap-2 text-sm font-medium text-highlighted">
      <span>{{ props.label }}</span>
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </span>

    <FormInput
      v-model="modelValue"
      v-bind="forwardedInputAttrs"
      :name="props.name"
      :type="props.type"
      :placeholder="props.placeholder"
      :icon="props.icon"
      :required="props.required"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-errormessage="errorMessage ? errorId : undefined"
    >
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>

      <template v-if="$slots.trailing" #trailing>
        <slot name="trailing" />
      </template>
    </FormInput>

    <p v-if="errorMessage" :id="errorId" class="text-xs font-medium text-error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-else-if="props.help" :id="helpId" class="text-xs text-toned">
      {{ props.help }}
    </p>
  </label>
</template>

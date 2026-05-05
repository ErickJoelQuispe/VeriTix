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

watch(modelValue, () => {
  formContext?.clearError(props.name)
})
</script>

<template>
  <label :class="['space-y-2', fieldClass]">
    <div class="flex items-center gap-2 text-sm font-medium text-highlighted">
      <span>{{ props.label }}</span>
      <span v-if="props.required" class="text-warning" aria-hidden="true">*</span>
    </div>

    <FormInput
      v-model="modelValue"
      v-bind="forwardedInputAttrs"
      :name="props.name"
      :type="props.type"
      :placeholder="props.placeholder"
      :icon="props.icon"
      :required="props.required"
    >
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>

      <template v-if="$slots.trailing" #trailing>
        <slot name="trailing" />
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

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

const fieldClass = computed(() => attrs.class)

const forwardedInputAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
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
      :type="props.type"
      :placeholder="props.placeholder"
      :icon="props.icon"
    >
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>

      <template v-if="$slots.trailing" #trailing>
        <slot name="trailing" />
      </template>
    </BaseFormInput>
  </UFormField>
</template>

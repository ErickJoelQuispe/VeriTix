<script setup lang="ts">
type SelectColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type SelectVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
type SelectSize = 'xs' | 'sm' | 'md' | 'lg'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: Array<{ label: string, value: string | number, disabled?: boolean }>
  label: string
  name: string
  color?: SelectColor
  variant?: SelectVariant
  size?: SelectSize
  disabled?: boolean
  placeholder?: string
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  disabled: false,
  placeholder: '',
})

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()

const fieldClass = computed(() => attrs.class)
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <UFormField
    :name="props.name"
    :label="props.label"
    :class="fieldClass"
  >
    <USelect
      v-model="modelValue"
      v-bind="forwardedAttrs"
      :items="props.items"
      :color="props.color"
      :variant="props.variant"
      :size="props.size"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      class="w-full"
    />
  </UFormField>
</template>

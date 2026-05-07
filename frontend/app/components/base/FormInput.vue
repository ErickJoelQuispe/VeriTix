<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  color?: InputColor
  variant?: InputVariant
  size?: InputSize
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
})
type InputColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
type InputVariant = 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const modelValue = defineModel<string | number | undefined>()
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const inputClass = computed(() => {
  const customClass = attrs.class
  return ['w-full', customClass]
})
</script>

<template>
  <UInput
    v-model="modelValue"
    v-bind="forwardedAttrs"
    :color="props.color"
    :variant="props.variant"
    :size="props.size"
    :class="inputClass"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>

    <slot />
  </UInput>
</template>

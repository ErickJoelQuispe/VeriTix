<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rows?: number
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'lg',
  rows: 5,
})

const modelValue = defineModel<string | undefined>()
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const textareaClass = computed(() => {
  const customClass = attrs.class
  return ['w-full', customClass]
})
</script>

<template>
  <UTextarea
    v-model="modelValue"
    v-bind="forwardedAttrs"
    :color="props.color"
    :variant="props.variant"
    :size="props.size"
    :rows="props.rows"
    :class="textareaClass"
  />
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  src: undefined,
  alt: undefined,
  text: undefined,
  size: 'md',
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const avatarClass = computed(() => attrs.class)

const sizeClass = computed(() => {
  const sizes = {
    xs: 'size-6 text-[0.6rem]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-14 text-lg',
  }

  return sizes[props.size]
})
</script>

<template>
  <div
    v-bind="forwardedAttrs"
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-default/60 bg-default/40 text-highlighted" :class="[sizeClass, avatarClass]"
  >
    <img
      v-if="props.src"
      :src="props.src"
      :alt="props.alt || props.text || 'Avatar'"
      class="size-full object-cover"
    >
    <span v-else class="font-semibold uppercase tracking-wide">
      {{ props.text || (props.alt?.trim()?.charAt(0)?.toUpperCase() ?? '?') }}
    </span>
  </div>
</template>

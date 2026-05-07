<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const containerClass = computed(() => {
  return ['relative flex min-h-[88vh] items-center justify-center py-12 sm:py-16', attrs.class]
})
</script>

<template>
  <UContainer v-bind="forwardedAttrs" :class="containerClass">
    <slot />
  </UContainer>
</template>

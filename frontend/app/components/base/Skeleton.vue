<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const skeletonClass = computed(() => attrs.class)
</script>

<template>
  <div v-bind="forwardedAttrs" :class="['animate-pulse rounded-xl bg-default/45', skeletonClass]" />
</template>

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
  <BaseSpinner
    v-bind="forwardedAttrs"
    :class="[skeletonClass]"
  />
</template>

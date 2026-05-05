<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const mainClass = computed(() => attrs.class)
</script>

<template>
  <main v-bind="forwardedAttrs" :class="mainClass">
    <slot />
  </main>
</template>

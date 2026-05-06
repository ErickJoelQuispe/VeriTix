<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const containerClass = computed(() => attrs.class)
</script>

<template>
  <div v-bind="forwardedAttrs" class="mx-auto w-full max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8" :class="[containerClass]">
    <slot />
  </div>
</template>

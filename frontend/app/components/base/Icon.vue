<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  name: string
}>()

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const iconClass = computed(() => attrs.class)
</script>

<template>
  <span
    v-bind="forwardedAttrs"
    :class="['inline-block align-middle leading-none', props.name, iconClass]"
    aria-hidden="true"
  />
</template>

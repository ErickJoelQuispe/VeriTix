<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  spinnerClass?: string
}>(), {
  spinnerClass: 'size-4',
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const rootClass = computed(() => attrs.class)
</script>

<template>
  <div
    v-bind="forwardedAttrs"
    class="grid place-items-center"
    :class="[rootClass]"
    role="status"
    aria-busy="true"
    aria-label="Cargando"
  >
    <span
      class="inline-block shrink-0 animate-spin rounded-full border-4 border-lavender border-r-transparent"
      :class="props.spinnerClass"
      aria-hidden="true"
    />
  </div>
</template>

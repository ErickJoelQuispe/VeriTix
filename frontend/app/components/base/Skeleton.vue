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
  <div
    v-bind="forwardedAttrs"
    class="relative isolate grid place-items-center overflow-hidden rounded-xl bg-default/45"
    :class="[skeletonClass]"
    role="status"
    aria-busy="true"
    aria-label="Cargando"
  >
    <svg
      class="size-4 shrink-0 text-muted"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" class="opacity-25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        stroke-width="2.75"
        stroke-linecap="round"
        class="origin-center animate-spin text-toned [animation-duration:900ms]"
      />
    </svg>
  </div>
</template>

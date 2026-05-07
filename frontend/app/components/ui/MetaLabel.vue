<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    tone?: 'default' | 'accent'
  }>(),
  {
    as: 'p',
    tone: 'default',
  },
)
</script>

<template>
  <component
    :is="as"
    class="text-xs font-semibold tracking-wide uppercase"
    :class="tone === 'accent' ? 'text-secondary' : 'text-dimmed'"
  >
    <slot />
  </component>
</template>

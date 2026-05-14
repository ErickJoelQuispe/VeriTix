<script setup lang="ts">
defineProps<{
  to: string
}>()
</script>

<template>
  <BaseButton
    variant="outlined"
    size="sm"
    leading-icon="i-lucide-arrow-left"
    :to="to"
  >
    <slot />
  </BaseButton>
</template>

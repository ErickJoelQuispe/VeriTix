<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  tone?: 'error' | 'success' | 'info'
}>(), {
  tone: 'error',
})

const alertColor = computed(() => {
  if (props.tone === 'success') {
    return 'success'
  }

  if (props.tone === 'info') {
    return 'neutral'
  }

  return 'error'
})

const alertIcon = computed(() => {
  if (props.tone === 'success') {
    return 'i-lucide-check-circle'
  }

  if (props.tone === 'info') {
    return 'i-lucide-info'
  }

  return 'i-lucide-alert-circle'
})
</script>

<template>
  <UAlert
    :title="message"
    :color="alertColor"
    variant="soft"
    :icon="alertIcon"
  />
</template>

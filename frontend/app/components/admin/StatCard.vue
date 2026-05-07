<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  value: string | number
  hint?: string
  icon: string
  tone?: 'default' | 'warning' | 'success' | 'primary' | 'error'
}>(), {
  hint: '',
  tone: 'default',
})

const iconBoxClass = computed(() => {
  const base = 'flex size-10 items-center justify-center rounded-lg border'

  if (props.tone === 'warning') {
    return `${base} border-warning/20 bg-warning/10 text-warning`
  }
  if (props.tone === 'success') {
    return `${base} border-success/20 bg-success/10 text-success`
  }
  if (props.tone === 'primary') {
    return `${base} border-primary/20 bg-primary/10 text-primary`
  }
  if (props.tone === 'error') {
    return `${base} border-error/20 bg-error/10 text-error`
  }

  return `${base} border-default bg-default/60 text-muted`
})
</script>

<template>
  <UiGlassPanel tone="subtle" radius="md" padding="md">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-3">
        <UiMetaLabel>
          {{ label }}
        </UiMetaLabel>

        <div class="space-y-1">
          <p class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ value }}
          </p>
          <p v-if="hint" class="text-sm text-toned">
            {{ hint }}
          </p>
        </div>
      </div>

      <div :class="iconBoxClass">
        <UIcon :name="icon" class="size-5" />
      </div>
    </div>
  </UiGlassPanel>
</template>

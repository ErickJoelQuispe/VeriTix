<script setup lang="ts">
export interface FormSurfaceProps {
  eyebrow: string
  title: string
  description: string
  icon: string
  variant?: 'default' | 'warning' | 'success' | 'primary' | 'error'
  highlights?: readonly string[]
}

const props = withDefaults(defineProps<FormSurfaceProps>(), {
  variant: 'default',
  highlights: () => [],
})

const trimmedHighlights = computed(() => props.highlights.slice(0, 4))

const iconContainerClasses = computed(() => {
  const base = 'size-12 rounded-xl border flex items-center justify-center shrink-0'

  if (props.variant === 'warning') {
    return `${base} bg-warning/10 border-warning/20 text-warning`
  }
  if (props.variant === 'success') {
    return `${base} bg-success/10 border-success/20 text-success`
  }
  if (props.variant === 'primary') {
    return `${base} bg-primary/10 border-primary/20 text-primary`
  }
  if (props.variant === 'error') {
    return `${base} bg-error/10 border-error/20 text-error`
  }

  return `${base} bg-elevated border-default text-muted`
})

const pillClasses = 'rounded-xl border border-default bg-elevated px-3 py-2 text-center text-xs font-semibold tracking-wide uppercase text-toned'
</script>

<template>
  <AdminCard padding="none">
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col gap-5 border-b border-default pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs font-semibold tracking-widest uppercase text-dimmed">
            {{ eyebrow }}
          </p>
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold tracking-tight text-default sm:text-3xl">
              {{ title }}
            </h2>
            <p class="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {{ description }}
            </p>
          </div>
        </div>

        <div :class="iconContainerClasses">
          <UIcon :name="icon" class="size-5" />
        </div>
      </div>

      <!-- Highlights -->
      <div v-if="trimmedHighlights.length > 0" class="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mt-6">
        <div
          v-for="highlight in trimmedHighlights"
          :key="highlight"
          :class="pillClasses"
        >
          {{ highlight }}
        </div>
      </div>

      <!-- Form Slot -->
      <div :class="trimmedHighlights.length > 0 ? 'mt-6' : ''">
        <slot />
      </div>
    </div>
  </AdminCard>
</template>

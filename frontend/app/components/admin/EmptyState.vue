<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}>(), {
  actionLabel: '',
  actionTo: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-10 text-center">
    <div class="flex size-12 items-center justify-center rounded-full border border-default bg-default/60 text-muted">
      <UIcon :name="icon" class="size-5" />
    </div>

    <div class="space-y-1.5">
      <p class="text-base font-semibold text-highlighted">
        {{ title }}
      </p>
      <p class="max-w-sm text-sm leading-relaxed text-toned">
        {{ description }}
      </p>
    </div>

    <BaseButton v-if="actionLabel && actionTo" kind="secondary" size="sm" :to="actionTo">
      {{ actionLabel }}
    </BaseButton>
  </div>
</template>

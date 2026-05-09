<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    kicker?: string
  }>(),
  {
    eyebrow: '',
    description: '',
    kicker: '',
  },
)
</script>

<template>
  <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="w-full max-w-130 overflow-hidden">
    <header class="flex items-center justify-between gap-4 pb-4">
      <UiMetaLabel v-if="eyebrow" tone="accent">
        {{ eyebrow }}
      </UiMetaLabel>

      <span
        v-if="kicker"
        class="rounded-full border border-default/60 bg-default/20 px-3 py-1 font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase"
      >
        {{ kicker }}
      </span>
    </header>

    <div class="pt-3 sm:pt-4">
      <h1 class="font-display text-4xl leading-[0.92] tracking-tight text-highlighted sm:text-5xl">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-3 text-sm leading-relaxed text-toned sm:text-base"
      >
        {{ description }}
      </p>

      <div class="mt-4 h-px w-full bg-muted/35" />

      <div class="mt-7">
        <slot />
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-default/55 pt-4 text-sm text-toned">
        <slot name="meta" />
      </div>
    </div>
  </UiPanel>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    panelTitle: string
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
    <header class="flex items-start justify-between gap-4 border-b border-default/60 pb-5">
      <div class="space-y-1">
        <UiMetaLabel v-if="eyebrow" tone="accent">
          {{ eyebrow }}
        </UiMetaLabel>

        <strong class="block font-display text-2xl font-normal leading-none tracking-tight text-highlighted sm:text-3xl">
          {{ panelTitle }}
        </strong>
      </div>

      <span
        v-if="kicker"
        class="rounded-full border border-default/60 bg-default/20 px-3 py-1 font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase"
      >
        {{ kicker }}
      </span>
    </header>

    <div class="pt-7">
      <h1 class="font-display text-4xl leading-[0.92] tracking-tight text-highlighted sm:text-5xl">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-3 max-w-[34ch] text-sm leading-relaxed text-toned sm:text-base"
      >
        {{ description }}
      </p>

      <div class="mt-7">
        <slot />
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-default/55 pt-4 text-sm text-toned">
        <slot name="meta" />
      </div>
    </div>
  </UiPanel>
</template>

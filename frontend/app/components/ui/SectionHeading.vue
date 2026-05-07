<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    center?: boolean
  }>(),
  {
    eyebrow: '',
    description: '',
    center: false,
  },
)
</script>

<template>
  <div
    class="max-w-3xl space-y-4" :class="[
      center ? 'mx-auto text-center' : 'text-left',
    ]"
  >
    <div
      class="mb-0.5 inline-flex items-center gap-2"
      :class="center ? 'mx-auto' : ''"
      aria-hidden="true"
    >
      <span
        class="h-px w-[2.2rem] bg-linear-to-r from-primary/80 to-secondary/80"
      />
      <span
        class="h-[0.62rem] w-[0.62rem] rounded-full border border-white/35 bg-radial-[at_30%_30%] from-white/92 to-crimson-400/74 shadow-[0_0_12px_rgb(240_100_127_/_0.4)]"
      />
      <span
        class="h-px w-[2.2rem] bg-linear-to-r from-primary/80 to-secondary/80"
      />
    </div>

    <UiMetaLabel
      v-if="eyebrow"
      tone="accent"
    >
      {{ eyebrow }}
    </UiMetaLabel>

    <h2 class="font-display text-4xl leading-[1.02] text-highlighted md:text-5xl">
      {{ title }}
    </h2>

    <div
      class="h-px w-28 rounded-full bg-linear-to-r from-primary/80 via-secondary/65 to-transparent"
      :class="center ? 'mx-auto' : ''"
    />

    <p
      v-if="description"
      class="text-sm leading-relaxed text-toned md:text-base"
    >
      {{ description }}
    </p>
  </div>
</template>

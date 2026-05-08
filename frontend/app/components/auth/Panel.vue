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
  <section class="vtx-auth-panel">
    <header class="vtx-auth-panel-head">
      <strong class="font-display text-3xl font-normal leading-none tracking-tight text-highlighted">
        {{ panelTitle }}
      </strong>

      <span
        v-if="kicker"
        class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase"
      >
        {{ kicker }}
      </span>
    </header>

    <div class="vtx-auth-panel-body">
      <span
        v-if="eyebrow"
        class="mb-3 block font-mono text-xs tracking-widest text-muted uppercase"
      >
        {{ eyebrow }}
      </span>

      <h1 class="font-display text-6xl leading-[0.92] tracking-tight text-highlighted">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-3 max-w-[34ch] text-toned"
      >
        {{ description }}
      </p>

      <div class="mt-7">
        <slot />
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <slot name="meta" />
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-auth-panel {
  @apply w-full max-w-130 overflow-hidden rounded-panel border border-default/80 bg-elevated/75 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm;
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--color-error) 9%, transparent) 0%, transparent 42%),
    linear-gradient(180deg, color-mix(in oklch, var(--color-elevated) 84%, transparent), color-mix(in oklch, var(--color-default) 82%, transparent));
}

.vtx-auth-panel-head {
  @apply flex items-center justify-between border-b border-default/70 px-6 py-5;
}

.vtx-auth-panel-body {
  @apply px-6 pb-6 pt-7;
}
</style>

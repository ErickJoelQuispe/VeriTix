<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description: string
  primaryActionTo?: string
  primaryActionLabel?: string
}>(), {
  primaryActionTo: '',
  primaryActionLabel: '',
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="mx-auto max-w-7xl space-y-8">
        <header class="flex flex-col gap-4 border-b border-default/55 pb-7 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-3">
            <p class="vtx-eyebrow">
              Backoffice
            </p>

            <div class="space-y-1.5">
              <h1 class="font-display text-5xl leading-[0.92] tracking-tight text-highlighted sm:text-6xl">
                {{ title }}
              </h1>
              <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                {{ description }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <slot name="actions" />
            <BaseButton
              v-if="primaryActionTo && primaryActionLabel"
              :to="primaryActionTo"
              variant="primary"
              size="sm"
              leading-icon="i-lucide-plus"
            >
              {{ primaryActionLabel }}
            </BaseButton>
          </div>
        </header>

        <slot />
      </div>
    </BaseContainer>
  </section>
</template>

<style>
.vtx-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--color-highlighted) 60%, var(--color-muted));
}
</style>

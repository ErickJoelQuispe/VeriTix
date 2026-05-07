<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description: string
    badge?: string
    actionTo?: string
    actionLabel?: string
    tone?: 'vivid' | 'minimal'
  }>(),
  {
    eyebrow: '',
    badge: '',
    actionTo: '',
    actionLabel: '',
    tone: 'vivid',
  },
)

const toneClasses = computed(() => {
  if (props.tone === 'minimal') {
    return {
      section: 'py-10 sm:py-12 lg:py-14',
      glow: 'from-white/6 via-transparent to-transparent',
      leftGlow: 'bg-white/6',
      rightGlow: 'bg-white/5',
      bottomGlow: 'bg-white/4',
      divider: 'border-default/45',
      badgeColor: 'neutral' as const,
      action: 'border-default/60 bg-default/6',
      aside: 'border-default/45',
      title: 'text-highlighted',
    }
  }

  return {
    section: 'py-10 sm:py-14 lg:py-16',
    glow: 'from-primary/12 via-transparent to-transparent',
    leftGlow: 'bg-secondary/12',
    rightGlow: 'bg-auric-500/14',
    bottomGlow: 'bg-primary/10',
    divider: 'border-default/60',
    badgeColor: 'warning' as const,
    action: 'border-default/70 bg-default/10',
    aside: 'border-default/55',
    title: 'bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-sm',
  }
})
</script>

<template>
  <section class="vtx-settings-shell relative" :class="toneClasses.section">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 h-56 bg-linear-to-b" :class="toneClasses.glow" />
      <div class="absolute -left-16 top-28 h-56 w-56 rounded-full blur-3xl" :class="toneClasses.leftGlow" />
      <div class="absolute -right-20 top-10 h-72 w-72 rounded-full blur-3xl" :class="toneClasses.rightGlow" />
      <div class="absolute bottom-0 left-1/4 h-48 w-48 rounded-full blur-3xl" :class="toneClasses.bottomGlow" />
      <div
        v-if="tone === 'vivid'"
        class="absolute right-[14%] top-28 hidden h-px w-36 bg-linear-to-r from-transparent via-secondary/35 to-transparent lg:block"
      />
      <div
        v-if="tone === 'vivid'"
        class="absolute bottom-24 left-[12%] hidden h-px w-40 bg-linear-to-r from-transparent via-auric-300/35 to-transparent xl:block"
      />
    </div>

    <UContainer class="relative">
      <div class="mx-auto max-w-6xl space-y-8 lg:space-y-10">
        <header class="grid gap-8 border-b pb-8 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-end" :class="toneClasses.divider">
          <div class="space-y-5">
            <div class="flex flex-wrap items-center gap-3">
              <UiMetaLabel
                v-if="eyebrow"
                tone="accent"
              >
                {{ eyebrow }}
              </UiMetaLabel>

              <BaseBadge
                v-if="badge"
                kind="accent"
                :color="toneClasses.badgeColor"
                size="xs"
                icon="i-lucide-sparkles"
                leading
              >
                {{ badge }}
              </BaseBadge>
            </div>

            <div class="space-y-3">
              <h1 class="max-w-4xl font-display text-3xl leading-tight sm:text-4xl lg:text-5xl" :class="toneClasses.title">
                {{ title }}
              </h1>

              <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                {{ description }}
              </p>
            </div>
          </div>

          <div class="flex items-end lg:justify-end">
            <BaseButton
              v-if="actionTo && actionLabel"
              kind="secondary"
              :to="actionTo"
              size="lg"
              class="px-5"
              :class="toneClasses.action"
            >
              {{ actionLabel }}
            </BaseButton>
          </div>
        </header>

        <section v-if="$slots.hero" class="border-b pb-8" :class="toneClasses.divider">
          <slot name="hero" />
        </section>

        <div class="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] xl:gap-10">
          <div class="min-w-0">
            <slot />
          </div>

          <aside v-if="$slots.aside" class="border-t pt-8 xl:border-t-0 xl:border-l xl:pl-8 xl:pt-0" :class="toneClasses.aside">
            <slot name="aside" />
          </aside>
        </div>
      </div>
    </UContainer>
  </section>
</template>

<style scoped>
.vtx-settings-shell {
  isolation: isolate;
}
</style>

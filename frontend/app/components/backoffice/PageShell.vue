<script setup lang="ts">
import { BACKOFFICE_NAV_ITEMS } from '@/utils/navigation/ia'

interface BackofficePageNavigationItem {
  label: string
  to: string
  icon: string
}

const props = withDefaults(defineProps<{
  title: string
  description: string
  primaryActionTo?: string
  primaryActionLabel?: string
  navigationItems?: BackofficePageNavigationItem[]
}>(), {
  primaryActionTo: '',
  primaryActionLabel: '',
})

const DEFAULT_NAVIGATION_ITEMS: BackofficePageNavigationItem[] = BACKOFFICE_NAV_ITEMS

const route = useRoute()

const navigationItems = computed(() => {
  return props.navigationItems ?? DEFAULT_NAVIGATION_ITEMS
})

const navigationSegments = computed(() => {
  return navigationItems.value.map(item => ({
    ...item,
    value: item.to,
    testId: `backoffice-nav-${item.label.toLowerCase()}`,
  }))
})

const activeNavigation = computed(() => {
  return navigationItems.value.find(item => isActive(item.to))?.to ?? '/backoffice/dashboard'
})

function isActive(path: string): boolean {
  if (path === '/backoffice') {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="mx-auto max-w-7xl space-y-8">
        <!-- Header -->
        <header class="space-y-5 border-b border-default/55 pb-7">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
          </div>

          <!-- Navigation -->
          <nav class="flex flex-wrap gap-2" aria-label="Navegación backoffice">
            <BackofficeSegmentedControl
              :items="navigationSegments"
              :active-value="activeNavigation"
              size="sm"
            />
          </nav>
        </header>

        <!-- Content -->
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

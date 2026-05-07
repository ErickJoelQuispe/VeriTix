<script setup lang="ts">
import { BACKOFFICE_NAV_ITEMS } from '~/utils/navigation/ia'

const route = useRoute()

function isBackofficeActive(path: string): boolean {
  if (path === '/backoffice') {
    return route.path === path
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/55 bg-default/75 backdrop-blur-md">
    <BaseContainer class="py-3.5 sm:py-4">
      <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-6">
        <NuxtLink
          to="/backoffice"
          class="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <span class="vtx-header-brand-mark" aria-hidden="true" />

          <div class="min-w-0">
            <p class="truncate font-display text-2xl leading-none tracking-wide text-highlighted">
              VeriTix
            </p>
            <p class="vtx-brand-note truncate">
              Backoffice / admin access
            </p>
          </div>
        </NuxtLink>

        <nav class="flex items-center justify-center px-2" aria-label="Navegación backoffice">
          <div class="inline-flex flex-wrap items-center gap-1 rounded-full border border-default/60 bg-elevated/45 p-1 shadow-sm backdrop-blur-sm">
            <NuxtLink
              v-for="item in BACKOFFICE_NAV_ITEMS"
              :key="item.to"
              :to="item.to"
              class="rounded-full px-3 py-1.5 text-xs tracking-wide text-muted uppercase transition hover:bg-default/10 hover:text-highlighted"
              :class="isBackofficeActive(item.to) && 'bg-default/75 font-medium text-highlighted shadow-sm ring-1 ring-primary/20'"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3 justify-self-end">
          <span class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">Admin</span>
          <BaseButton variant="secondary" to="/" size="xs" class="px-3.5 text-xs tracking-wide uppercase">
            Exit
          </BaseButton>
        </div>
      </div>
    </BaseContainer>
  </header>
</template>

<script setup lang="ts">
import { ACCOUNT_NAV_ITEMS } from '@/utils/navigation/ia'

const route = useRoute()

function isActive(item: { to: string }): boolean {
  if (item.to.includes('#')) {
    return false
  }

  if (item.to === '/users/me') {
    return route.path === '/users/me'
  }

  return route.path.startsWith(item.to)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/55 bg-default/75 backdrop-blur-md">
    <BaseContainer class="py-3.5 sm:py-4">
      <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-6">
        <NuxtLink
          to="/"
          class="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <p class="truncate font-display text-2xl leading-none tracking-wide text-highlighted">
            VeriTix
          </p>
          <p class="vtx-account-note hidden sm:block">
            Mi cuenta
          </p>
        </NuxtLink>

        <nav class="flex items-center justify-center px-2" aria-label="Navegación de cuenta">
          <div class="inline-flex flex-wrap items-center gap-1 rounded-full border border-default/60 bg-elevated/45 p-1 shadow-sm backdrop-blur-sm">
            <NuxtLink
              v-for="item in ACCOUNT_NAV_ITEMS"
              :key="item.to"
              :to="item.to"
              class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs tracking-wide text-muted uppercase transition-all duration-200 hover:bg-default/10 hover:text-highlighted"
              :class="isActive(item) ? 'bg-default/75 font-medium text-highlighted shadow-sm ring-1 ring-primary/20' : ''"
            >
              <BaseIcon :name="item.icon" class="size-3.5" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3 justify-self-end">
          <BaseButton variant="secondary" to="/" size="xs" class="px-3.5 text-xs tracking-wide uppercase">
            Volver
          </BaseButton>
        </div>
      </div>
    </BaseContainer>
  </header>
</template>

<style>
.vtx-account-note {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}
</style>

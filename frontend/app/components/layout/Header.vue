<script setup lang="ts">
import { MAIN_NAV_ITEMS } from '~/utils/navigation/ia'

const { isAuthenticated, sessionStatus } = useAuth()
const route = useRoute()

const showGuestActions = computed(() => {
  return sessionStatus.value !== 'unknown' && !isAuthenticated.value
})

const showAccountMenu = computed(() => {
  return sessionStatus.value !== 'unknown' && isAuthenticated.value
})

const mainNavItems = MAIN_NAV_ITEMS
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/70 bg-default/80 backdrop-blur-xl">
    <BaseContainer class="py-4">
      <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <NuxtLink
          to="/"
          class="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg pr-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <span class="vtx-header-brand-mark" aria-hidden="true" />

          <div class="min-w-0">
            <p class="truncate font-display text-2xl leading-none tracking-wide text-highlighted">
              VeriTix
            </p>
            <p class="vtx-brand-note truncate">
              Live events / ledger access
            </p>
          </div>
        </NuxtLink>

        <nav class="flex items-center justify-center px-3" aria-label="Navegación principal">
          <div class="inline-flex items-center gap-1 rounded-full border border-default/70 bg-elevated/55 p-1">
            <NuxtLink
              v-for="item in mainNavItems"
              :key="item.to"
              :to="item.to"
              class="rounded-full px-3 py-1.5 text-xs tracking-wide text-muted uppercase transition hover:text-highlighted"
              :class="(item.to === '/' ? route.path === '/' : route.path.startsWith(item.to)) && 'bg-default/60 text-highlighted'"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3">
          <div class="flex shrink-0 items-center gap-2">
            <ClientOnly>
              <template v-if="showGuestActions">
                <BaseButton
                  to="/login"
                  kind="secondary"
                  size="xs"
                  class="px-3.5 text-xs tracking-wide uppercase"
                >
                  Iniciar sesión
                </BaseButton>

                <BaseButton
                  to="/register"
                  kind="primary"
                  size="xs"
                  class="px-3.5 text-xs tracking-wide uppercase"
                >
                  Registrarse
                </BaseButton>
              </template>

              <template v-else-if="showAccountMenu">
                <LayoutAccountMenu />
              </template>

              <div v-else class="h-8 w-24" aria-hidden="true" />

              <template #fallback>
                <div class="h-8 w-24" aria-hidden="true" />
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </BaseContainer>
  </header>
</template>

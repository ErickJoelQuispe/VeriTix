<script setup lang="ts">
import { BACKOFFICE_NAV_ITEMS, MAIN_NAV_ITEMS } from '~/utils/navigation/ia'

const { user, isAuthenticated, sessionStatus } = useAuth()
const route = useRoute()
const accountMenuItems = useAccountMenuItems(() => user.value?.role === 'ADMIN')

const authRoutes = ['/login', '/register', '/forgot-password']

const headerVariant = computed(() => {
  if (route.path.startsWith('/backoffice')) {
    return 'backoffice'
  }

  if (authRoutes.includes(route.path)) {
    return 'auth'
  }

  return 'public'
})

const showGuestActions = computed(() => {
  return sessionStatus.value !== 'unknown' && !isAuthenticated.value
})

const showAccountMenu = computed(() => {
  return sessionStatus.value !== 'unknown' && isAuthenticated.value
})

const accountAvatarAlt = computed(() => {
  const fullName = [user.value?.name, user.value?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || user.value?.email || 'Mi cuenta'
})

const accountInitials = computed(() => {
  const initials = [user.value?.name, user.value?.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  if (initials) {
    return initials
  }

  return user.value?.email?.trim()?.charAt(0)?.toUpperCase() || 'V'
})

const accountDisplayName = computed(() => {
  const fullName = [user.value?.name, user.value?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || 'Mi cuenta'
})

const accountSubtitle = computed(() => {
  return user.value?.email || 'Gestioná tu perfil y ajustes'
})

const mainNavItems = MAIN_NAV_ITEMS
const backofficeNavItems = BACKOFFICE_NAV_ITEMS

const headerClass = computed(() => {
  return headerVariant.value === 'auth'
    ? 'sticky top-0 z-40 border-b border-default/70 bg-default/85 backdrop-blur'
    : 'sticky top-0 z-40 border-b border-default/70 bg-default/80 backdrop-blur-xl'
})

function isBackofficeActive(path: string): boolean {
  if (path === '/backoffice') {
    return route.path === path
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header :class="headerClass">
    <BaseContainer class="py-4">
      <div
        v-if="headerVariant === 'auth'"
        class="flex items-center justify-between gap-4"
      >
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

        <BaseButton kind="secondary" to="/" size="xs" class="px-3.5 text-xs tracking-wide uppercase">
          Home
        </BaseButton>
      </div>

      <div v-else-if="headerVariant === 'backoffice'" class="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <NuxtLink
          to="/backoffice"
          class="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg pr-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
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

        <nav class="flex items-center justify-center px-3" aria-label="Navegación backoffice">
          <div class="inline-flex flex-wrap items-center gap-1 rounded-full border border-default/70 bg-elevated/55 p-1">
            <NuxtLink
              v-for="item in backofficeNavItems"
              :key="item.to"
              :to="item.to"
              class="rounded-full px-3 py-1.5 text-xs tracking-wide text-muted uppercase transition hover:text-highlighted"
              :class="isBackofficeActive(item.to) && 'bg-default/60 text-highlighted'"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3">
          <span class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">Admin</span>
          <BaseButton kind="secondary" to="/" size="xs" class="px-3.5 text-xs tracking-wide uppercase">
            Exit
          </BaseButton>
        </div>
      </div>

      <div v-else class="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
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
                <UiAccountMenu
                  :title="accountDisplayName"
                  :subtitle="accountSubtitle"
                  :items="accountMenuItems"
                  :avatar-alt="accountAvatarAlt"
                  :avatar-initials="accountInitials"
                  :avatar-src="user?.avatarUrl || undefined"
                />
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

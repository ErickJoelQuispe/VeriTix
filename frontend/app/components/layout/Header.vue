<script setup lang="ts">
import { MAIN_NAV_ITEMS } from '~/utils/navigation/ia'

const { user, isAuthenticated, sessionStatus } = useAuth()
const route = useRoute()
const accountMenuItems = useAccountMenuItems(() => user.value?.role === 'ADMIN')

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

const headerClass = 'sticky top-0 z-40 border-b border-default/55 bg-default/75 backdrop-blur-md'

function isMainNavActive(path: string): boolean {
  if (path === '/') {
    return route.path === path
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <header :class="headerClass">
    <BaseContainer class="py-3.5 sm:py-4">
      <div class="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6">
        <NuxtLink
          to="/"
          class="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <span class="vtx-header-brand-mark" aria-hidden="true">
            <span class="vtx-header-brand-mark-letter">V</span>
          </span>

          <div class="min-w-0">
            <p class="truncate font-display text-2xl leading-none tracking-wide text-highlighted sm:text-[2.05rem]">
              VeriTix
            </p>
            <p class="vtx-brand-note truncate text-[0.66rem] sm:text-[0.7rem]">
              Live events / ledger access
            </p>
          </div>
        </NuxtLink>

        <nav class="flex items-center justify-center" aria-label="Navegación principal">
          <div class="inline-flex w-full items-center justify-center gap-1 rounded-full border border-default/60 bg-elevated/45 p-1 shadow-sm backdrop-blur-sm lg:w-auto">
            <NuxtLink
              v-for="item in mainNavItems"
              :key="item.to"
              :to="item.to"
              class="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase transition-all duration-200"
              :class="isMainNavActive(item.to)
                ? 'bg-default/85 text-highlighted shadow-sm ring-1 ring-primary/20'
                : 'text-muted hover:bg-default/10 hover:text-highlighted'"
            >
              <span class="size-1.5 rounded-full bg-current opacity-35 transition group-hover:opacity-70" aria-hidden="true" />
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3 justify-self-end">
          <div class="inline-flex items-center gap-2 rounded-full border border-default/60 bg-elevated/45 p-1.5 shadow-sm backdrop-blur-sm">
            <ClientOnly>
              <template v-if="showGuestActions">
                <BaseButton
                  to="/login"
                  variant="outlined"
                  size="xs"
                  class="!rounded-full !px-4 !py-1.5 !text-[0.7rem] !tracking-[0.12em]"
                >
                  Iniciar sesión
                </BaseButton>

                <BaseButton
                  to="/register"
                  variant="reversed"
                  size="xs"
                  class="!rounded-full !px-4 !py-1.5 !text-[0.7rem] !tracking-[0.12em]"
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

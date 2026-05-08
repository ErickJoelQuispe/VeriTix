<script setup lang="ts">
import { MAIN_NAV_ITEMS } from '@/utils/navigation/ia'

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
      <div class="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <NuxtLink
          to="/"
          class="vtx-header-brand-link flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <svg class="vtx-header-brand-prism h-9 w-9 shrink-0" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="vtx-header-brand-prism-fill" x1="14" y1="10" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="color-mix(in oklch, var(--color-accent) 68%, white)" />
                <stop offset="52%" stop-color="color-mix(in oklch, var(--color-secondary) 70%, var(--color-accent))" />
                <stop offset="100%" stop-color="color-mix(in oklch, var(--color-primary) 34%, var(--color-accent))" />
              </linearGradient>
              <linearGradient id="vtx-header-brand-prism-face" x1="18" y1="12" x2="46" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="rgb(255 255 255 / 0.88)" />
                <stop offset="100%" stop-color="rgb(255 255 255 / 0.1)" />
              </linearGradient>
            </defs>

            <path
              d="M32 5 53 17 59 35 48 55 32 60 16 55 5 35 11 17Z"
              fill="url(#vtx-header-brand-prism-fill)"
              stroke="rgb(255 255 255 / 0.22)"
              stroke-width="1.25"
              stroke-linejoin="round"
            />
            <path d="M32 5 53 17 32 29 11 17Z" fill="url(#vtx-header-brand-prism-face)" />
            <path d="M11 17 32 29 32 60 16 55 5 35Z" fill="rgb(255 255 255 / 0.08)" />
            <path d="M53 17 59 35 48 55 32 60 32 29Z" fill="rgb(255 255 255 / 0.14)" />
            <path d="M32 29 44 35 32 60 20 35Z" fill="rgb(255 255 255 / 0.12)" />
          </svg>

          <p class="truncate font-display text-3xl leading-none tracking-wide text-highlighted sm:text-4xl">
            VeriTix
          </p>
        </NuxtLink>

        <nav class="flex items-center justify-center" aria-label="Navegación principal">
          <div class="inline-flex w-full items-center justify-center gap-6 lg:w-auto">
            <NuxtLink
              v-for="item in mainNavItems"
              :key="item.to"
              :to="item.to"
              class="group inline-flex items-center py-2 text-base font-medium tracking-wide transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-default"
              :class="isMainNavActive(item.to)
                ? 'text-highlighted'
                : 'text-muted hover:text-highlighted'"
            >
              <span class="relative pb-1">
                {{ item.label }}

                <span
                  class="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-primary/70 transition-transform duration-200 motion-reduce:transition-none group-hover:scale-x-100"
                  :class="isMainNavActive(item.to) ? 'scale-x-100' : ''"
                  aria-hidden="true"
                />
              </span>
            </NuxtLink>
          </div>
        </nav>

        <div class="flex shrink-0 items-center gap-3 justify-self-end">
          <div class="inline-flex items-center gap-2 rounded-full border border-default/55 bg-elevated/35 p-1 backdrop-blur-sm">
            <ClientOnly>
              <template v-if="showGuestActions">
                <BaseButton
                  to="/login"
                  variant="outlined"
                  size="xs"
                  class="rounded-full! px-4! py-1.5! text-[0.7rem]! tracking-[0.12em]!"
                >
                  Iniciar sesión
                </BaseButton>

                <BaseButton
                  to="/register"
                  variant="reversed"
                  size="xs"
                  class="rounded-full! px-4! py-1.5! text-[0.7rem]! tracking-[0.12em]!"
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

<style scoped>
.vtx-header-brand-link:hover .vtx-header-brand-prism {
  filter: drop-shadow(0 0 14px color-mix(in oklch, var(--color-accent) 34%, transparent));
}
</style>

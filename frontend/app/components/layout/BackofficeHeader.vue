<script setup lang="ts">
import type { AccountMenuItem } from '@/composables/ui/useAccountMenuItems'
import { BACKOFFICE_NAV_ITEMS } from '@/utils/navigation/ia'

const { user, isAuthenticated, sessionStatus } = useAuth()
const accountMenuItems = useAccountMenuItems(() => user.value?.role === 'ADMIN')
const route = useRoute()

const backofficeMenuItems = computed<AccountMenuItem[]>(() => {
  return [
    {
      label: 'Volver al sitio',
      description: 'Ir a la página principal de VeriTix',
      to: '/',
      icon: 'i-lucide-arrow-left-from-line',
    },
    // En el backoffice el acceso directo a "Backoffice" es redundante
    ...accountMenuItems.value.filter(item => item.label !== 'Backoffice'),
  ]
})

const showGuestActions = computed(() => {
  return sessionStatus.value !== 'unknown' && !isAuthenticated.value
})

const showAccountMenu = computed(() => {
  return sessionStatus.value !== 'unknown' && isAuthenticated.value
})

const accountAvatarAlt = computed(() => {
  const fullName = [user.value?.name, user.value?.lastName].filter(Boolean).join(' ').trim()

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
  const fullName = [user.value?.name, user.value?.lastName].filter(Boolean).join(' ').trim()

  return fullName || 'Mi cuenta'
})

const accountSubtitle = computed(() => {
  return user.value?.email || 'Gestioná tu perfil y ajustes'
})

const navItems = BACKOFFICE_NAV_ITEMS

const headerClass = 'sticky top-0 z-40 border-b border-default/55 bg-default/75 backdrop-blur-md'

function isNavActive(path: string): boolean {
  if (path === '/backoffice') {
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
          to="/backoffice"
          class="flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <p class="truncate font-display text-3xl leading-none tracking-wide text-highlighted sm:text-4xl">
            VeriTix
          </p>
        </NuxtLink>

        <nav class="flex items-center justify-center" aria-label="Navegación backoffice">
          <div class="inline-flex w-full items-center justify-center gap-6 lg:w-auto">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="group inline-flex items-center py-2 text-base font-medium tracking-wide transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-default"
              :class="isNavActive(item.to) ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
            >
              <span class="relative pb-1">
                {{ item.label }}

                <span
                  class="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-primary/70 transition-transform duration-200 motion-reduce:transition-none group-hover:scale-x-100"
                  :class="isNavActive(item.to) ? 'scale-x-100' : ''"
                  aria-hidden="true"
                />
              </span>
            </NuxtLink>
          </div>
        </nav>

        <div class="flex h-16 shrink-0 items-center gap-3 justify-self-end">
          <ClientOnly>
            <template v-if="showGuestActions">
              <BaseButton
                to="/login"
                variant="primary"
                size="md"
                class="rounded-full! px-5! py-3! text-[0.72rem]! tracking-[0.12em]!"
              >
                Iniciar sesión
              </BaseButton>

              <BaseButton
                to="/register"
                variant="reversed"
                size="md"
                class="rounded-full! px-5! py-3! text-[0.72rem]! tracking-[0.12em]!"
              >
                Registrarse
              </BaseButton>
            </template>

            <template v-else-if="showAccountMenu">
              <UiAccountMenu
                :title="accountDisplayName"
                :subtitle="accountSubtitle"
                :items="backofficeMenuItems"
                :avatar-alt="accountAvatarAlt"
                :avatar-initials="accountInitials"
                :avatar-src="user?.avatarUrl || undefined"
              />
            </template>

            <LayoutHeaderLoadingState v-else />

            <template #fallback>
              <LayoutHeaderLoadingState />
            </template>
          </ClientOnly>
        </div>
      </div>
    </BaseContainer>
  </header>
</template>

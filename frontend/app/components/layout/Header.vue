<script setup lang="ts">
import { MAIN_NAV_ITEMS, MY_EVENTS_NAV_ITEM } from '~/utils/navigation/ia'

const { user, isAuthenticated, sessionStatus } = useAuth()
const route = useRoute()
const accountMenuItems = useAccountMenuItems(
  () => user.value?.role === 'ADMIN',
  'Eventos, usuarios y artistas',
  () => user.value?.role === 'VALIDATOR' || user.value?.role === 'ADMIN',
)

const showValidatorLink = computed(() => {
  return sessionStatus.value !== 'unknown'
    && isAuthenticated.value
    && (user.value?.role === 'VALIDATOR' || user.value?.role === 'ADMIN')
})
const mobileMenuOpen = ref(false)

const showGuestActions = computed(() => {
  return sessionStatus.value !== 'unknown' && !isAuthenticated.value
})

const showAccountMenu = computed(() => {
  return sessionStatus.value !== 'unknown' && isAuthenticated.value
})

const accountMenuLinks = computed(() => {
  return [
    {
      label: MY_EVENTS_NAV_ITEM.label,
      description: 'Consultá tus reservas y tickets',
      to: MY_EVENTS_NAV_ITEM.to,
      icon: 'i-lucide-calendar-range',
    },
    ...accountMenuItems.value,
  ]
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

const mainNavItems = MAIN_NAV_ITEMS
const isSessionReady = computed(() => sessionStatus.value !== 'unknown')

const mobileUserLinks = computed(() => {
  if (!showAccountMenu.value) {
    return []
  }

  return accountMenuLinks.value
})

const headerClass = 'sticky top-0 z-40 border-b border-default/55 bg-default/75 backdrop-blur-md'

function isMainNavActive(path: string): boolean {
  if (path === '/') {
    return route.path === path
  }

  return route.path.startsWith(path)
}

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>

<template>
  <header :class="headerClass">
    <BaseContainer class="py-3.5 sm:py-4">
      <div class="flex items-center justify-between gap-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <NuxtLink
          to="/"
          class="vtx-header-brand-link flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl px-2 py-1.5 outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <p class="truncate font-display text-3xl leading-none tracking-wide text-highlighted sm:text-4xl">
            VeriTix
          </p>
        </NuxtLink>

        <div class="flex items-center lg:hidden">
          <ClientOnly>
            <template v-if="!isSessionReady">
              <LayoutHeaderLoadingState />
            </template>

            <BasePopover
              v-else
              v-model:open="mobileMenuOpen"
              :content="{ align: 'end', side: 'bottom', sideOffset: 12 }"
            >
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-default/60 bg-elevated/90 px-4 py-2 text-sm font-medium text-highlighted shadow-[0_10px_24px_-20px_rgb(0_0_0/0.8)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                :aria-expanded="mobileMenuOpen"
                aria-controls="header-mobile-menu"
                aria-label="Abrir menú de navegación"
              >
                <BaseIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-4" aria-hidden="true" />
                Menú
              </button>

              <template #content>
                <div id="header-mobile-menu" class="vtx-header-mobile-panel">
                  <div class="space-y-1.5">
                    <p class="vtx-header-mobile-section-title">
                      Navegación
                    </p>

                    <NuxtLink
                      v-for="item in mainNavItems"
                      :key="item.to"
                      :to="item.to"
                      class="vtx-header-mobile-link"
                      :class="isMainNavActive(item.to) ? 'vtx-header-mobile-link-active' : ''"
                      @click="mobileMenuOpen = false"
                    >
                      <span class="vtx-header-mobile-link-title">{{ item.label }}</span>
                    </NuxtLink>
                  </div>

                  <div v-if="showAccountMenu" class="mt-3 space-y-1.5">
                    <p class="vtx-header-mobile-section-title">
                      Tu cuenta
                    </p>

                    <NuxtLink
                      v-for="item in mobileUserLinks"
                      :key="item.to"
                      :to="item.to"
                      class="vtx-header-mobile-link"
                      @click="mobileMenuOpen = false"
                    >
                      <BaseIcon :name="item.icon" class="vtx-header-mobile-link-icon" aria-hidden="true" />

                      <div class="min-w-0 flex-1">
                        <p class="vtx-header-mobile-link-title">
                          {{ item.label }}
                        </p>
                        <p class="vtx-header-mobile-link-description truncate">
                          {{ item.description }}
                        </p>
                      </div>
                    </NuxtLink>
                  </div>

                  <div v-else-if="showGuestActions" class="mt-3 grid gap-2 px-1 pb-1">
                    <BaseButton
                      to="/login"
                      variant="primary"
                      size="md"
                      class="w-full justify-center rounded-full! px-5! py-3! text-[0.72rem]! tracking-[0.12em]!"
                      @click="mobileMenuOpen = false"
                    >
                      Iniciar sesión
                    </BaseButton>

                    <BaseButton
                      to="/register"
                      variant="reversed"
                      size="md"
                      class="w-full justify-center rounded-full! px-5! py-3! text-[0.72rem]! tracking-[0.12em]!"
                      @click="mobileMenuOpen = false"
                    >
                      Registrarse
                    </BaseButton>
                  </div>
                </div>
              </template>
            </BasePopover>

            <template #fallback>
              <LayoutHeaderLoadingState />
            </template>
          </ClientOnly>
        </div>

        <nav class="hidden items-center justify-center lg:flex" aria-label="Navegación principal">
          <div class="inline-flex w-full items-center justify-center gap-6 lg:w-auto">
            <NuxtLink
              v-for="item in mainNavItems"
              :key="item.to"
              :to="item.to"
              class="group inline-flex items-center py-2 text-base font-medium tracking-wide transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-default"
              :class="isMainNavActive(item.to) ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
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

        <div class="hidden h-16 shrink-0 items-center gap-3 justify-self-end lg:flex">
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
              <BaseButton
                v-if="showValidatorLink"
                to="/validator"
                variant="outlined"
                size="sm"
                leading-icon="i-lucide-scan-qr-code"
                class="hidden sm:inline-flex"
              >
                Panel Validador
              </BaseButton>

              <UiAccountMenu
                :title="accountDisplayName"
                :subtitle="accountSubtitle"
                :items="accountMenuLinks"
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

<style scoped>
@reference "@/assets/css/main.css";

.vtx-header-mobile-panel {
  @apply w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-3xl border p-2 shadow-[0_30px_64px_-44px_rgb(0_0_0/0.86)];
  background-color: var(--color-elevated);
  border-color: color-mix(in srgb, var(--color-lavender) 14%, color-mix(in srgb, var(--color-border) 82%, white));
  backdrop-filter: none;
}

.vtx-header-mobile-section-title {
  @apply px-3 pb-2 pt-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-toned/70;
}

.vtx-header-mobile-link {
  @apply flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35;
}

.vtx-header-mobile-link:hover {
  background: rgb(255 255 255 / 0.05);
}

.vtx-header-mobile-link-active {
  background: color-mix(in srgb, var(--color-lavender) 16%, var(--color-elevated));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-lavender) 22%, transparent);
}

.vtx-header-mobile-link-active .vtx-header-mobile-link-title {
  color: var(--color-lavender);
}

.vtx-header-mobile-link-active .vtx-header-mobile-link-icon {
  color: var(--color-lavender);
}

.vtx-header-mobile-link-title {
  @apply text-sm font-medium text-highlighted;
}

.vtx-header-mobile-link-description {
  @apply text-xs text-toned;
}

.vtx-header-mobile-link-icon {
  @apply size-4 shrink-0 text-muted;
}
</style>

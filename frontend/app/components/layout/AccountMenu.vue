<script setup lang="ts">
const { user } = useAuth()

const accountMenuItems = computed(() => {
  const items = [] as Array<{
    label: string
    description: string
    to: string
    icon: string
  }>

  if (user.value?.role === 'ADMIN') {
    items.push({
      label: 'Panel admin',
      description: 'Eventos, usuarios y artistas',
      to: '/admin',
      icon: 'i-lucide-shield-check',
    })
  }

  items.push({
    label: 'Ajustes',
    description: 'Perfil, contacto y seguridad',
    to: '/users/me',
    icon: 'i-lucide-settings-2',
  })

    items.push({
    label: 'Cerrar sesión',
    description: 'Salir de VeriTix de forma segura',
    to: '/users/me/logout',
    icon: 'i-lucide-log-out',
  })

  return items
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
</script>

<template>
  <UPopover :content="{ align: 'end', side: 'bottom', sideOffset: 12 }">
    <button
      type="button"
      class="vtx-account-trigger"
      :aria-label="`Abrir menú de ${accountAvatarAlt}`"
    >
      <UAvatar
        :src="user?.avatarUrl || undefined"
        :alt="accountAvatarAlt"
        :text="accountInitials"
        size="md"
        class="vtx-account-avatar"
      />
    </button>

    <template #content>
      <div class="vtx-account-panel">
        <div class="vtx-account-panel-hero">
          <UAvatar
            :src="user?.avatarUrl || undefined"
            :alt="accountAvatarAlt"
            :text="accountInitials"
            size="lg"
            class="vtx-account-panel-avatar"
          />

          <div class="min-w-0">
            <p class="vtx-account-panel-title truncate">
              {{ accountDisplayName }}
            </p>
            <p class="vtx-account-panel-subtitle truncate">
              {{ accountSubtitle }}
            </p>
          </div>
        </div>

        <NuxtLink
          v-for="item in accountMenuItems"
          :key="item.to"
          :to="item.to"
          class="vtx-account-panel-link"
        >
          <div class="vtx-account-panel-link-icon-wrap" aria-hidden="true">
            <UIcon :name="item.icon" class="vtx-account-panel-link-icon" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="vtx-account-panel-link-title">
              {{ item.label }}
            </p>
            <p class="vtx-account-panel-link-subtitle truncate">
              {{ item.description }}
            </p>
          </div>

          <UIcon name="i-lucide-arrow-up-right" class="vtx-account-panel-link-arrow" aria-hidden="true" />
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-account-trigger {
  @apply inline-flex cursor-pointer items-center justify-center rounded-full;
  padding: 0.14rem;
  border: 0;
  background: rgb(255 255 255 / 0.02);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 6px 14px -16px rgb(0 0 0 / 0.82);
  transition:
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.vtx-account-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.28),
    0 0 0 5px rgb(239 170 71 / 0.07),
    inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-trigger:hover {
  background: rgb(255 255 255 / 0.04);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 8px 18px -18px rgb(0 0 0 / 0.84);
}

.vtx-account-trigger:active {
  background: rgb(255 255 255 / 0.055);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 4px 10px -16px rgb(0 0 0 / 0.78);
}

.vtx-account-avatar {
  background: linear-gradient(135deg, rgb(239 170 71 / 0.78), rgb(20 128 188 / 0.78));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 8px 18px -14px rgb(0 0 0 / 0.85);
}
</style>

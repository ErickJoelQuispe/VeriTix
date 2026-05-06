<script setup lang="ts">
const { user } = useAuth()

const accountMenuItems = useAccountMenuItems(() => user.value?.role === 'ADMIN')

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
  <BasePopover :content="{ align: 'end', side: 'bottom', sideOffset: 12 }">
    <button
      type="button"
      class="vtx-account-trigger"
      :aria-label="`Abrir menú de ${accountAvatarAlt}`"
    >
      <BaseAvatar
        :src="user?.avatarUrl || undefined"
        :alt="accountAvatarAlt"
        :text="accountInitials"
        size="md"
        class="vtx-account-avatar"
      />
    </button>

    <template #content>
      <UiAccountMenuPanel
        :title="accountDisplayName"
        :subtitle="accountSubtitle"
        :items="accountMenuItems"
      >
        <template #avatar>
          <BaseAvatar
            :src="user?.avatarUrl || undefined"
            :alt="accountAvatarAlt"
            :text="accountInitials"
            size="lg"
            class="vtx-account-panel-avatar"
          />
        </template>
      </UiAccountMenuPanel>
    </template>
  </BasePopover>
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

<script setup lang="ts">
const props = defineProps<{
  initials: string
  fullName: string
  email: string
  avatarConfigured: boolean
  phone: string
  isAdmin: boolean
  roleView: { title: string, capabilities: string[] } | null
}>()

const accountMenuItems = computed(() => {
  const items = [] as Array<{
    label: string
    description: string
    to: string
    icon: string
  }>

  if (props.isAdmin) {
    items.push({
      label: 'Panel admin',
      description: 'Gestión de eventos, usuarios y artistas',
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
</script>

<template>
  <div class="space-y-8">
    <section class="relative vtx-profile-presence space-y-5 border-b border-default/55 pb-8">
      <div class="flex items-center gap-4">
        <UPopover :content="{ align: 'start', side: 'bottom', sideOffset: 12 }">
          <button
            type="button"
            class="vtx-profile-avatar-trigger"
            :aria-label="`Abrir acciones de cuenta de ${fullName || email}`"
          >
            <div class="vtx-profile-avatar flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-auric-100">
              {{ initials }}
            </div>
          </button>

          <template #content>
            <div class="vtx-account-panel">
              <div class="vtx-account-panel-hero">
                <div class="vtx-profile-avatar flex size-14 shrink-0 items-center justify-center rounded-2xl text-base font-semibold text-auric-100">
                  {{ initials }}
                </div>

                <div class="min-w-0">
                  <p class="vtx-account-panel-title truncate">
                    {{ fullName }}
                  </p>
                  <p class="vtx-account-panel-subtitle truncate">
                    {{ email }}
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

        <div>
          <UiMetaLabel>
            Identidad visible
          </UiMetaLabel>
          <p class="mt-2 text-lg font-semibold text-highlighted">
            {{ fullName }}
          </p>
          <p class="mt-1 text-sm text-toned">
            {{ email }}
          </p>
          <p class="mt-2 text-xs text-dimmed">
            Pulsa el avatar para abrir acciones de cuenta.
          </p>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div class="vtx-profile-signal">
          <UiMetaLabel>
            Avatar
          </UiMetaLabel>
          <p class="mt-2 text-sm font-semibold text-highlighted">
            {{ avatarConfigured ? 'Configurado' : 'Sin personalizar' }}
          </p>
        </div>

        <div class="vtx-profile-signal">
          <UiMetaLabel>
            Teléfono
          </UiMetaLabel>
          <p class="mt-2 text-sm font-semibold text-highlighted">
            {{ phone || 'Pendiente' }}
          </p>
        </div>
      </div>
    </section>

    <section v-if="roleView" class="relative vtx-profile-role space-y-4 border-b border-default/55 pb-8">
      <div>
        <UiMetaLabel tone="accent">
          {{ roleView.title }}
        </UiMetaLabel>
      </div>

      <ul class="space-y-3">
        <li
          v-for="capability in roleView.capabilities"
          :key="capability"
          class="flex items-start gap-3 text-sm leading-relaxed text-toned"
        >
          <span class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary">
            <UIcon name="i-lucide-check" class="size-3.5" />
          </span>
          <span>{{ capability }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-profile-presence::before {
  @apply absolute -left-2 top-0 hidden h-28 w-28 rounded-full blur-3xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(239 170 71 / 0.16), rgb(255 255 255 / 0));
}

.vtx-profile-avatar {
  border: 1px solid rgb(239 170 71 / 0.45);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.86), rgb(255 255 255 / 0) 38%),
    linear-gradient(135deg, rgb(239 170 71 / 0.4), rgb(44 189 230 / 0.4), rgb(240 100 127 / 0.28));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.04),
    0 18px 34px -24px rgb(239 170 71 / 0.8);
}

.vtx-profile-avatar-trigger {
  @apply inline-flex cursor-pointer rounded-[1.1rem] p-1 transition-all duration-150 ease-out;
  background: rgb(255 255 255 / 0.03);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 10px 22px -22px rgb(0 0 0 / 0.85);
}

.vtx-profile-avatar-trigger:hover {
  background: rgb(255 255 255 / 0.05);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 16px 26px -22px rgb(239 170 71 / 0.28);
}

.vtx-profile-avatar-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.3),
    0 0 0 5px rgb(239 170 71 / 0.08),
    inset 0 0 0 1px rgb(255 255 255 / 0.06);
}

.vtx-profile-signal {
  @apply relative pl-4;
}

.vtx-profile-signal::before {
  @apply absolute bottom-0 left-0 top-0 w-0.5 rounded-full;
  content: '';
  background: linear-gradient(180deg, rgb(239 170 71 / 0.9), rgb(44 189 230 / 0.8));
}

.vtx-profile-role::after {
  @apply absolute right-0 top-0 hidden h-20 w-20 rounded-full blur-2xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(44 189 230 / 0.14), rgb(255 255 255 / 0));
}
</style>

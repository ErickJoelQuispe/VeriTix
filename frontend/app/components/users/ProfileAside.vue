<script setup lang="ts">
const {
  initials,
  fullName,
  email,
  avatarConfigured,
  phone,
  roleView,
} = defineProps<{
  initials: string
  fullName: string
  email: string
  avatarConfigured: boolean
  phone: string
  isAdmin: boolean
  roleView: { title: string, capabilities: string[] } | null
}>()
</script>

<template>
  <div class="space-y-8">
    <section class="relative vtx-profile-presence space-y-5 border-b border-default/55 pb-8">
      <div class="flex items-center gap-4">
        <div class="vtx-profile-avatar flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-highlighted">
          {{ initials }}
        </div>

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
            <BaseIcon name="i-lucide-check" class="size-3.5" />
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

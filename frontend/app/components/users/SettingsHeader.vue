<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
}>()

const route = useRoute()

const navigationItems = [
  {
    label: 'Perfil',
    to: '/users/me',
    icon: 'i-lucide-user-round',
  },
  {
    label: 'Seguridad',
    to: '/users/me#seguridad',
    icon: 'i-lucide-shield-check',
  },
] as const

function isActive(path: string) {
  if (path === '/users/me#seguridad') {
    return route.path === '/users/me' && route.hash === '#seguridad'
  }

  return route.path === path && !route.hash
}
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-3">
      <UiMetaLabel tone="accent">
        Ajustes de cuenta
      </UiMetaLabel>

      <div class="space-y-2">
        <h1 class="font-display text-3xl text-highlighted md:text-4xl">
          {{ props.title }}
        </h1>
        <p class="max-w-2xl text-sm leading-relaxed text-toned md:text-base">
          {{ props.description }}
        </p>
      </div>
    </div>

    <nav class="flex flex-wrap gap-3" aria-label="Navegación de ajustes de cuenta">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
        :class="isActive(item.to)
          ? 'border-primary/55 bg-primary/12 text-highlighted shadow-[0_10px_30px_-24px_var(--color-primary-500)]'
          : 'border-default/70 bg-default/35 text-toned hover:border-primary/30 hover:bg-default/55 hover:text-highlighted'"
      >
        <UIcon :name="item.icon" class="size-4" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </section>
</template>

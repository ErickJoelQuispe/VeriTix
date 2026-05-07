<script setup lang="ts">
const { isAuthenticated, hydrated } = useAuth()
const route = useRoute()

const showGuestActions = computed(() => {
  return hydrated.value && !isAuthenticated.value
})

const showAccountAction = computed(() => {
  return hydrated.value && isAuthenticated.value
})

const isEventsRoute = computed(() => {
  return route.path.startsWith('/events')
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default/45 bg-default/88">
    <UContainer class="py-2.5 sm:py-3">
      <div class="vtx-header-minimal grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 sm:px-4">
        <NuxtLink
          to="/"
          class="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg pr-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          <span class="vtx-header-brand-mark" aria-hidden="true" />

          <div class="min-w-0">
            <p class="truncate font-display text-xl leading-none tracking-wide text-highlighted">
              VeriTix
            </p>
            <UiMetaLabel as="p" class="truncate text-dimmed/90">
              Atlas progresivo de conciertos
            </UiMetaLabel>
          </div>
        </NuxtLink>

        <nav class="flex items-center justify-center px-3" aria-label="Navegación principal">
          <NuxtLink
            to="/events"
            class="vtx-nav-link"
            :class="isEventsRoute && 'vtx-nav-link--active'"
          >
            Eventos
          </NuxtLink>
        </nav>

        <div class="flex shrink-0 items-center gap-3">
          <!-- Auth buttons -->
          <div class="flex shrink-0 items-center gap-2">
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

            <ClientOnly v-else-if="isAuthenticated">
              <LayoutAccountMenu />
            </ClientOnly>

            <template v-else />
          </div>
        </div>
      </div>
    </UContainer>
  </header>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-header-minimal {
  @apply relative rounded-2xl;
  border: 1px solid rgb(145 161 190 / 0.25);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.01)),
    linear-gradient(136deg, rgb(11 17 31 / 0.74), rgb(16 23 40 / 0.78));
  box-shadow:
    0 10px 20px -22px rgb(0 0 0 / 0.7),
    inset 0 0 0 1px rgb(255 255 255 / 0.03);
}

.vtx-header-minimal::after {
  @apply absolute bottom-0 left-0 right-0 h-px pointer-events-none;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(239 170 71 / 0),
    rgb(239 170 71 / 0.5),
    rgb(20 128 188 / 0.5),
    rgb(239 170 71 / 0)
  );
}

.vtx-header-brand-mark {
  @apply relative inline-flex h-8 w-8 rounded-full;
  border: 1px solid rgb(239 170 71 / 0.6);
  background:
    radial-gradient(circle at 32% 30%, rgb(255 255 255 / 0.8), rgb(255 255 255 / 0) 42%),
    linear-gradient(135deg, rgb(239 170 71 / 0.75), rgb(20 128 188 / 0.75));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 0 18px rgb(239 170 71 / 0.32);
}

.vtx-header-brand-mark::before {
  @apply absolute rounded-full;
  content: '';
  inset: 0.35rem;
  border: 1px solid rgb(255 255 255 / 0.44);
  background: rgb(10 15 27 / 0.42);
}

.vtx-nav-link {
  @apply inline-flex min-h-9 cursor-pointer items-center justify-center border-b border-transparent bg-transparent px-2 py-1 text-xs font-semibold tracking-wide text-dimmed uppercase no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35;
}

.vtx-nav-link:hover {
  @apply border-primary/30 text-highlighted;
}

.vtx-nav-link--active {
  @apply border-primary/45 text-primary;
}

@media (max-width: 639px) {
  .vtx-header-minimal {
    grid-template-columns: auto auto;
  }

  .vtx-header-minimal nav {
    order: 3;
    grid-column: 1 / -1;
    justify-content: center;
    padding-top: 0.25rem;
  }
}
</style>

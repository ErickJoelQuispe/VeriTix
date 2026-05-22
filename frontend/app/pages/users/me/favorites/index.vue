<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Mis eventos favoritos | VeriTix',
  description: 'Todos los eventos que guardaste como favoritos.',
})

const page = ref(1)
const LIMIT = 9
const hasLoaded = ref(false)

const { favorites, total, isLoading, error, fetchMyFavorites } = useMyFavorites()
const favoritesMap = ref<Record<string, boolean>>({})

async function loadFavorites() {
  hasLoaded.value = false

  try {
    await fetchMyFavorites({ page: page.value, limit: LIMIT })

    for (const item of favorites.value) {
      if (!(item.event.id in favoritesMap.value)) {
        favoritesMap.value[item.event.id] = true
      }
    }
  }
  finally {
    hasLoaded.value = true
  }
}

onMounted(() => {
  void loadFavorites()
})

const showPagination = computed(() => total.value > LIMIT && !error.value)

async function handlePageChange(next: number) {
  if (next === page.value) { return }
  page.value = next
  await loadFavorites()
}

async function handleToggleFavorite(eventId: string) {
  const { toggle, isFavorited } = useFavorite(eventId, true)
  favoritesMap.value[eventId] = false

  try {
    await toggle()

    if (!isFavorited.value) {
      favorites.value = favorites.value.filter(item => item.event.id !== eventId)
      total.value = Math.max(0, total.value - 1)

      if (favorites.value.length === 0 && page.value > 1) {
        page.value -= 1
        await loadFavorites()
      }
    }
  }
  catch {
    favoritesMap.value[eventId] = true
  }
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
        <UiPageHeading
          eyebrow="Mi cuenta"
          title="Mis eventos favoritos"
          description="Tus eventos guardados para volver rápido cuando quieras."
        >
          <template #actions>
            <BaseButton
              to="/users/me/events"
              variant="outlined"
              size="sm"
              leading-icon="i-lucide-calendar"
            >
              Mis eventos
            </BaseButton>
          </template>
        </UiPageHeading>

        <div v-if="isLoading || !hasLoaded" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <BaseSkeleton v-for="i in 6" :key="i" class="h-104 rounded-2xl" />
        </div>

        <div
          v-else-if="error"
          class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
        >
          <div class="mx-auto flex max-w-md flex-col items-center gap-4">
            <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
            <div class="space-y-2">
              <p class="text-lg font-semibold text-highlighted">
                No pudimos cargar tus favoritos
              </p>
              <p class="text-sm leading-relaxed text-toned">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <UiEmptyState
          v-else-if="favorites.length === 0"
          icon="i-lucide-heart-off"
          title="No tenés favoritos todavía"
          description="Guardá eventos desde mis eventos para verlos acá."
          action-label="Ver eventos"
          action-to="/events"
        />

        <template v-else>
          <div class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <UsersFavoriteEventCard
              v-for="item in favorites"
              :key="item.id"
              :item="item"
              :is-favorited="favoritesMap[item.event.id] ?? true"
              @toggle-favorite="handleToggleFavorite(item.event.id)"
              @view-detail="navigateTo(`/events/${item.event.id}`)"
            />
          </div>

          <div v-if="showPagination" class="flex justify-center pt-2">
            <BasePagination
              :page="page"
              :total="total"
              :items-per-page="LIMIT"
              :sibling-count="1"
              size="sm"
              color="neutral"
              variant="ghost"
              active-color="primary"
              active-variant="soft"
              show-edges
              @update:page="handlePageChange"
            />
          </div>
        </template>
      </div>
    </BaseContainer>
  </section>
</template>

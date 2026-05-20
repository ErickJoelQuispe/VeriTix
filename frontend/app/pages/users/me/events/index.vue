<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Mis Eventos | VeriTix',
  description: 'Todos los eventos a los que fuiste o vas a ir.',
})

const upcoming = ref(true)
const page = ref(1)
const LIMIT = 9

const { events, total, isLoading, error, fetchMyEvents } = useMyEvents()

const favoritesMap = ref<Record<string, boolean>>({})

async function loadEvents() {
  await fetchMyEvents({ upcoming: upcoming.value, page: page.value, limit: LIMIT })
  // Initialize favorites map for newly loaded events (default false — individual check on detail open)
  for (const item of events.value) {
    if (!(item.event.id in favoritesMap.value)) {
      favoritesMap.value[item.event.id] = false
    }
  }
}

onMounted(() => {
  void loadEvents()
})

async function setUpcoming(value: boolean) {
  if (value === upcoming.value) { return }
  upcoming.value = value
  page.value = 1
  await loadEvents()
}

async function handleToggleFavorite(eventId: string) {
  const { toggle } = useFavorite(eventId)
  favoritesMap.value[eventId] = !favoritesMap.value[eventId]

  try {
    await toggle()
    // toggle() handles its own optimistic state but we mirror it here
  }
  catch {
    // Revert on error
    favoritesMap.value[eventId] = !favoritesMap.value[eventId]
  }
}

const showPagination = computed(() => total.value > LIMIT && !error.value)

async function handlePageChange(next: number) {
  if (next === page.value) { return }
  page.value = next
  await loadEvents()
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
        <UiPageHeading
          eyebrow="Mi cuenta"
          title="Mis eventos"
          description="Todos los eventos a los que fuiste o vas a ir."
        >
          <template #actions>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton
                :variant="upcoming ? 'primary' : 'outlined'"
                size="sm"
                leading-icon="i-lucide-calendar-clock"
                @click="setUpcoming(true)"
              >
                Próximos
              </BaseButton>

              <BaseButton
                :variant="!upcoming ? 'primary' : 'outlined'"
                size="sm"
                leading-icon="i-lucide-history"
                @click="setUpcoming(false)"
              >
                Pasados
              </BaseButton>
            </div>
          </template>
        </UiPageHeading>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <BaseSkeleton v-for="i in 6" :key="i" class="h-104 rounded-2xl" />
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
        >
          <div class="mx-auto flex max-w-md flex-col items-center gap-4">
            <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
            <div class="space-y-2">
              <p class="text-lg font-semibold text-highlighted">
                No pudimos cargar tus eventos
              </p>
              <p class="text-sm leading-relaxed text-toned">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <UiEmptyState
          v-else-if="events.length === 0"
          icon="i-lucide-calendar-x"
          title="No tenés eventos todavía"
          description="Explorá la cartelera y comprá tus entradas."
          action-label="Ver eventos"
          action-to="/events"
        />

        <!-- Grid de cards -->
        <template v-else>
          <div class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <UsersEventCard
              v-for="item in events"
              :key="item.event.id"
              :item="item"
              :is-favorited="favoritesMap[item.event.id] ?? false"
              @toggle-favorite="handleToggleFavorite(item.event.id)"
              @view-detail="navigateTo(`/users/me/events/${item.event.id}`)"
            />
          </div>

          <!-- Pagination -->
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

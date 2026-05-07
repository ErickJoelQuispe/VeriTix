<script setup lang="ts">
const route = useRoute()
const { getApiErrorMessage } = useApiErrorMessage()

const VISIBLE_GENRE_LIMIT = 8

function readQueryValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function readQueryPage(value: unknown): number {
  const page = Number(value)

  if (Number.isInteger(page) && page > 0) {
    return page
  }

  return 1
}

useSeoMeta({
  title: 'Eventos | VeriTix',
  description: 'Explorá conciertos y experiencias en vivo con filtros por género y ciudad.',
})

const searchDraft = ref(readQueryValue(route.query.search))
const artistNameDraft = ref('')
const showAllGenres = ref(false)

const filters = computed(() => {
  return {
    search: readQueryValue(route.query.search),
    genreId: readQueryValue(route.query.genreId),
    city: readQueryValue(route.query.city),
    page: readQueryPage(route.query.page),
  }
})

const { data: eventsResponse, status, error } = await usePublicEvents(filters)
const { genres, cities } = useEventCatalogFilters()

const genreOptions = computed(() => {
  return genres.data.value ?? []
})

const cityOptions = computed(() => {
  return cities.value
})

const visibleGenres = computed(() => {
  if (showAllGenres.value || genreOptions.value.length <= VISIBLE_GENRE_LIMIT) {
    return genreOptions.value
  }

  const selectedGenre = genreOptions.value.find(genre => genre.id === filters.value.genreId)
  const leadingGenres = genreOptions.value.slice(0, VISIBLE_GENRE_LIMIT)

  if (selectedGenre && !leadingGenres.some(genre => genre.id === selectedGenre.id)) {
    return [...leadingGenres.slice(0, VISIBLE_GENRE_LIMIT - 1), selectedGenre]
  }

  return leadingGenres
})

const hiddenGenresCount = computed(() => {
  return Math.max(genreOptions.value.length - visibleGenres.value.length, 0)
})

watch(() => filters.value.search, (value) => {
  searchDraft.value = value
})

watch(() => filters.value.genreId, (value) => {
  if (!value) {
    showAllGenres.value = false
  }
})

const events = computed(() => eventsResponse.value?.data ?? [])
const meta = computed(() => {
  return eventsResponse.value?.meta ?? {
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  }
})

const selectedGenreLabel = computed(() => {
  return genreOptions.value.find(genre => genre.id === filters.value.genreId)?.name ?? ''
})

const resultsHeading = computed(() => {
  return `${meta.value.total} resultado${meta.value.total === 1 ? '' : 's'}`
})

const resultsContext = computed(() => {
  const segments = [
    filters.value.search ? `búsqueda: “${filters.value.search}”` : '',
    selectedGenreLabel.value ? `género: ${selectedGenreLabel.value}` : '',
    filters.value.city ? `ciudad: ${filters.value.city}` : '',
  ].filter(Boolean)

  if (segments.length === 0) {
    return 'Explorá la cartelera disponible y encontrá el plan adecuado.'
  }

  return segments.join(' · ')
})

const activeFilterCount = computed(() => {
  return [filters.value.search, filters.value.genreId, filters.value.city].filter(Boolean).length
})
const isPending = computed(() => status.value === 'pending')
const eventsErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar los eventos en este momento.')
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.value.search || filters.value.genreId || filters.value.city)
})

async function updateFilters(next: Partial<typeof filters.value>) {
  const shouldResetPage = next.search !== undefined || next.genreId !== undefined || next.city !== undefined
  const query = {
    search: next.search ?? filters.value.search,
    genreId: next.genreId ?? filters.value.genreId,
    city: next.city ?? filters.value.city,
    page: shouldResetPage ? 1 : (next.page ?? filters.value.page),
  }

  await navigateTo({
    path: '/events',
    query: {
      search: query.search || undefined,
      genreId: query.genreId || undefined,
      city: query.city || undefined,
      page: query.page > 1 ? String(query.page) : undefined,
    },
  })
}

async function submitSearch() {
  // TODO(backend): include `artistName: artistNameDraft.value.trim()` in the public events
  // query once the API supports artist-name filtering end-to-end.
  await updateFilters({ search: searchDraft.value.trim() })
}

async function clearFilters() {
  searchDraft.value = ''
  await navigateTo('/events')
}

async function handlePageChange(page: number) {
  if (page === filters.value.page || isPending.value) {
    return
  }

  await updateFilters({ page })
}
</script>

<template>
  <UiEventsPageShell variant="index" container-class="relative">
    <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
      <header class="space-y-4 border-b border-default/55 pb-8">
        <UiMetaLabel tone="accent">
          Cartelera
        </UiMetaLabel>

        <div>
          <h1 class="font-display text-3xl text-highlighted sm:text-4xl lg:text-5xl">
            Eventos en vivo
          </h1>
          <p class="mt-2.5 max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
            Descubrí la cartelera y encontrá rápido lo que querés ver.
          </p>
        </div>
      </header>

      <section class="grid gap-8 xl:grid-cols-[292px_minmax(0,1fr)] xl:items-start xl:gap-10">
        <aside class="xl:sticky xl:top-24">
          <UiGlassPanel padding="lg" radius="md">
            <div class="border-b border-default/55 pb-5">
              <div>
                <UiMetaLabel tone="accent">
                  Filtros
                </UiMetaLabel>
              </div>

              <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap items-center gap-2">
                <p class="text-xs font-medium text-dimmed uppercase">
                  {{ activeFilterCount }} filtro{{ activeFilterCount > 1 ? 's' : '' }} activo{{ activeFilterCount > 1 ? 's' : '' }}
                </p>

                <BaseButton
                  kind="tertiary"
                  size="xs"
                  :disabled="isPending"
                  class="px-2.5"
                  @click="clearFilters"
                >
                  Limpiar todo
                </BaseButton>
              </div>
            </div>

            <div class="mt-5 space-y-4.5">
              <EventsFilterSection title="Búsqueda">
                <form class="mt-3.5 space-y-3" @submit.prevent="submitSearch">
                  <BaseFormInput
                    v-model="searchDraft"
                    placeholder="Buscar por evento"
                    icon="i-lucide-search"
                    :disabled="isPending"
                    class="min-w-0"
                  />

                  <BaseFormInput
                    v-model="artistNameDraft"
                    placeholder="Buscar por artista"
                    icon="i-lucide-mic-vocal"
                    :disabled="isPending"
                    class="min-w-0"
                  />

                  <BaseButton kind="primary" type="submit" size="sm" :loading="isPending" :disabled="isPending" block>
                    Buscar
                  </BaseButton>
                </form>
              </EventsFilterSection>

              <EventsFilterSection title="Géneros" :status="filters.genreId ? '1 seleccionado' : 'Top'">
                <div class="mt-3.5 flex flex-wrap gap-2.5">
                  <EventsFilterChip
                    label="Todos"
                    size="sm"
                    :active="!filters.genreId"
                    :disabled="isPending"
                    @click="updateFilters({ genreId: '' })"
                  />

                  <EventsFilterChip
                    v-for="genre in visibleGenres"
                    :key="genre.id"
                    :label="genre.name"
                    size="sm"
                    :active="filters.genreId === genre.id"
                    :disabled="isPending"
                    @click="updateFilters({ genreId: genre.id })"
                  />
                </div>

                <BaseButton
                  v-if="hiddenGenresCount > 0"
                  kind="tertiary"
                  size="xs"
                  class="mt-3 px-0"
                  :disabled="isPending"
                  @click="showAllGenres = !showAllGenres"
                >
                  {{ showAllGenres ? 'Mostrar menos' : `Ver ${hiddenGenresCount} más` }}
                </BaseButton>
              </EventsFilterSection>

              <EventsFilterSection title="Ubicación" :status="filters.city ? '1' : 'Todas'">
                <div class="mt-3.5 flex flex-wrap gap-2.5">
                  <EventsFilterChip
                    label="Todas"
                    size="sm"
                    :active="!filters.city"
                    :disabled="isPending"
                    @click="updateFilters({ city: '' })"
                  />

                  <EventsFilterChip
                    v-for="city in cityOptions"
                    :key="city"
                    :label="city"
                    size="sm"
                    :active="filters.city === city"
                    :disabled="isPending"
                    @click="updateFilters({ city })"
                  />
                </div>
              </EventsFilterSection>
            </div>
          </UiGlassPanel>
        </aside>

        <section class="space-y-7">
          <div class="border-b border-default/50 pb-4 sm:pb-5">
            <div class="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between md:gap-6">
              <div class="space-y-1">
                <UiMetaLabel>
                  Resultados
                </UiMetaLabel>
                <h2 class="text-2xl font-semibold text-highlighted sm:text-3xl">
                  {{ resultsHeading }}
                </h2>
              </div>

              <p class="max-w-2xl text-sm leading-relaxed text-toned/88 md:text-right">
                {{ resultsContext }}
              </p>
            </div>
          </div>

          <div v-if="isPending" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <USkeleton v-for="index in 6" :key="index" class="h-104 rounded-2xl" />
          </div>

          <div v-else-if="eventsErrorMessage" class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center">
            <div class="mx-auto flex max-w-md flex-col items-center gap-4">
              <UIcon name="i-lucide-cloud-off" class="size-8 text-error" />
              <div class="space-y-2">
                <p class="text-lg font-semibold text-highlighted">
                  No pudimos cargar la cartelera.
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ eventsErrorMessage }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="events.length === 0" class="rounded-2xl border border-default/65 bg-default/8 px-6 py-14 text-center">
            <p class="text-lg font-semibold text-highlighted">
              No hay eventos para estos filtros.
            </p>
          </div>

          <div v-else class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <EventsListingCard
              v-for="event in events"
              :key="event.id"
              :event="event"
            />
          </div>

          <div v-if="meta.totalPages > 1" class="mt-2 flex justify-center border-t border-default/55 pt-8">
            <UPagination
              :page="filters.page"
              :total="meta.total"
              :items-per-page="meta.limit"
              :disabled="isPending"
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
        </section>
      </section>
    </div>
  </UiEventsPageShell>
</template>

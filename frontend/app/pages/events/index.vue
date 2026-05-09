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

const resultsChips = computed(() => {
  return [
    { label: 'resultados', value: meta.value.total },
    { label: 'página', value: `${meta.value.page}/${Math.max(meta.value.totalPages, 1)}` },
    { label: 'filtros', value: activeFilterCount.value },
  ]
})
const isPending = computed(() => status.value === 'pending')
const hasDraftSearch = computed(() => Boolean(searchDraft.value.trim()))
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
  await updateFilters({ search: searchDraft.value.trim() })
}

async function clearFilters() {
  searchDraft.value = ''
  showAllGenres.value = false
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
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer class="relative">
      <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
        <div class="space-y-8">
          <UiPageHeading
            eyebrow="Cartelera"
            title="Curated Transmissions."
            description="Explorá la cartelera, refiná por género o ciudad, y pasá del descubrimiento al ticket en pocos pasos."
          />

          <UiPanel
            as="section"
            variant="glass"
            radius="xl"
            padding="lg"
            class="space-y-6"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-1">
                <UiMetaLabel tone="accent">
                  Controles
                </UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Buscá y refiná la cartelera desde un único bloque.
                </p>
              </div>

              <BaseButton
                v-if="hasDraftSearch || hasActiveFilters"
                variant="outlined"
                type="button"
                size="sm"
                :disabled="isPending"
                leading-icon="i-lucide-rotate-ccw"
                @click="clearFilters"
              >
                Limpiar todo
              </BaseButton>
            </div>

            <form class="max-w-3xl" @submit.prevent="submitSearch">
              <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <FormInput
                  v-model="searchDraft"
                  placeholder="Buscar eventos o artistas"
                  icon="i-lucide-search"
                  size="md"
                  :disabled="isPending"
                  class="min-w-0"
                />

                <BaseButton
                  variant="primary"
                  type="submit"
                  size="md"
                  :loading="isPending"
                  leading-icon="i-lucide-search"
                >
                  Buscar
                </BaseButton>
              </div>
            </form>

            <div class="grid gap-5 lg:grid-cols-2">
              <PagesEventsFilterSection title="Género" :status="filters.genreId ? '1 seleccionado' : 'Todos'">
                <div class="flex flex-wrap gap-2.5">
                  <PagesEventsFilterChip
                    label="Todos"
                    size="sm"
                    :active="!filters.genreId"
                    :disabled="isPending"
                    @click="updateFilters({ genreId: '' })"
                  />

                  <PagesEventsFilterChip
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
                  variant="outlined"
                  size="xs"
                  class="mt-3 px-0"
                  :disabled="isPending"
                  @click="showAllGenres = !showAllGenres"
                >
                  {{ showAllGenres ? 'Mostrar menos' : `Ver ${hiddenGenresCount} más` }}
                </BaseButton>
              </PagesEventsFilterSection>

              <PagesEventsFilterSection title="Ciudad" :status="filters.city ? '1 seleccionada' : 'Todas'">
                <div class="flex flex-wrap gap-2.5">
                  <PagesEventsFilterChip
                    label="Todas"
                    size="sm"
                    :active="!filters.city"
                    :disabled="isPending"
                    @click="updateFilters({ city: '' })"
                  />

                  <PagesEventsFilterChip
                    v-for="city in cityOptions"
                    :key="city"
                    :label="city"
                    size="sm"
                    :active="filters.city === city"
                    :disabled="isPending"
                    @click="updateFilters({ city })"
                  />
                </div>
              </PagesEventsFilterSection>
            </div>
          </UiPanel>
        </div>

        <section class="space-y-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div class="space-y-1">
              <UiMetaLabel tone="accent">
                Resultados
              </UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                {{ resultsContext }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <p class="text-sm font-medium text-highlighted">
                {{ resultsHeading }}
              </p>
              <BackofficeToolbarChips :items="resultsChips" />
            </div>
          </div>

          <div v-if="isPending" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <BaseSkeleton v-for="index in 6" :key="index" class="h-104 rounded-2xl" />
          </div>

          <div v-else-if="eventsErrorMessage" class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center">
            <div class="mx-auto flex max-w-md flex-col items-center gap-4">
              <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
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
            <UiEventCard
              v-for="event in events"
              :key="event.id"
              :event="event"
            />
          </div>

          <div v-if="meta.totalPages > 1" class="flex justify-center pt-2">
            <BasePagination
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
      </div>
    </BaseContainer>
  </section>
</template>

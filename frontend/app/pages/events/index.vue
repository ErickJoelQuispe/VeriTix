<script setup lang="ts">
const route = useRoute()
const { getApiErrorMessage } = useApiErrorMessage()

const ALL_OPTION_VALUE = '__all__'

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
  description:
    'Explorá conciertos y experiencias en vivo con filtros por nombre, artista, recinto, género y ciudad.',
})

const searchDraft = ref(readQueryValue(route.query.search))
const artistDraft = ref(readQueryValue(route.query.artistName))
const venueDraft = ref(readQueryValue(route.query.venueName))

const filters = computed(() => ({
  search: readQueryValue(route.query.search),
  artistName: readQueryValue(route.query.artistName),
  venueName: readQueryValue(route.query.venueName),
  genreId: readQueryValue(route.query.genreId),
  city: readQueryValue(route.query.city),
  page: readQueryPage(route.query.page),
}))

const { data: eventsResponse, status, error } = await usePublicEvents(filters)
const { genres, cities } = useEventCatalogFilters()

const genreOptions = computed(() => genres.data.value ?? [])
const cityOptions = computed(() => cities.value)

const genreItems = computed(() => [
  { label: 'Todos los géneros', value: ALL_OPTION_VALUE },
  ...genreOptions.value.map(genre => ({
    label: genre.name,
    value: genre.id,
  })),
])

const cityItems = computed(() => [
  { label: 'Todas las ciudades', value: ALL_OPTION_VALUE },
  ...cityOptions.value.map(city => ({ label: city, value: city })),
])

watch(
  () => filters.value.search,
  (value) => {
    searchDraft.value = value
  },
)

watch(
  () => filters.value.artistName,
  (value) => {
    artistDraft.value = value
  },
)

watch(
  () => filters.value.venueName,
  (value) => {
    venueDraft.value = value
  },
)

const events = computed(() => eventsResponse.value?.data ?? [])
const meta = computed(
  () =>
    eventsResponse.value?.meta ?? {
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 0,
    },
)

const selectedGenreLabel = computed(
  () =>
    genreOptions.value.find(genre => genre.id === filters.value.genreId)
      ?.name ?? '',
)
const resultsHeading = computed(
  () => `${meta.value.total} resultado${meta.value.total === 1 ? '' : 's'}`,
)

const resultsContext = computed(() => {
  const segments = [
    filters.value.search ? `evento: “${filters.value.search}”` : '',
    filters.value.artistName ? `artista: “${filters.value.artistName}”` : '',
    filters.value.venueName ? `recinto: “${filters.value.venueName}”` : '',
    selectedGenreLabel.value ? `género: ${selectedGenreLabel.value}` : '',
    filters.value.city ? `ciudad: ${filters.value.city}` : '',
  ].filter(Boolean)

  if (segments.length === 0) {
    return 'Explorá la cartelera disponible y encontrá el plan adecuado.'
  }

  return segments.join(' · ')
})

const activeFilterCount = computed(
  () =>
    [
      filters.value.search,
      filters.value.artistName,
      filters.value.venueName,
      filters.value.genreId,
      filters.value.city,
    ].filter(Boolean).length,
)

const resultsChips = computed(() => [
  { label: 'resultados', value: meta.value.total },
  {
    label: 'página',
    value: `${meta.value.page}/${Math.max(meta.value.totalPages, 1)}`,
  },
  { label: 'filtros', value: activeFilterCount.value },
])

const isPending = computed(() => status.value === 'pending')
const eventsErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return getApiErrorMessage(
    error.value,
    'No pudimos cargar los eventos en este momento.',
  )
})

const showPagination = computed(
  () =>
    !eventsErrorMessage.value
    && events.value.length > 0
    && meta.value.totalPages > 1,
)

async function updateFilters(next: Partial<typeof filters.value>) {
  const shouldResetPage
    = next.search !== undefined
      || next.artistName !== undefined
      || next.venueName !== undefined
      || next.genreId !== undefined
      || next.city !== undefined

  const query = {
    search: next.search ?? filters.value.search,
    artistName: next.artistName ?? filters.value.artistName,
    venueName: next.venueName ?? filters.value.venueName,
    genreId: next.genreId ?? filters.value.genreId,
    city: next.city ?? filters.value.city,
    page: shouldResetPage ? 1 : (next.page ?? filters.value.page),
  }

  await navigateTo({
    path: '/events',
    query: {
      search: query.search || undefined,
      artistName: query.artistName || undefined,
      venueName: query.venueName || undefined,
      genreId: query.genreId || undefined,
      city: query.city || undefined,
      page: query.page > 1 ? String(query.page) : undefined,
    },
  })
}

async function submitSearch() {
  await updateFilters({
    search: searchDraft.value.trim(),
    artistName: artistDraft.value.trim(),
    venueName: venueDraft.value.trim(),
  })
}

async function clearFilters() {
  searchDraft.value = ''
  artistDraft.value = ''
  venueDraft.value = ''
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
            title="Eventos"
            description="Explorá la cartelera, refiná por nombre, artista, recinto, género o ciudad, y pasá del descubrimiento al ticket en pocos pasos."
          />

          <UiPanel
            as="form"
            variant="glass"
            radius="xl"
            padding="lg"
            class="space-y-6"
            @submit.prevent="submitSearch"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div class="space-y-1">
                <UiMetaLabel as="h2" tone="accent">
                  Filtros
                </UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Buscá por evento, artista o recinto sin salir de la cartelera.
                </p>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <BaseButton
                  variant="outlined"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="isPending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="clearFilters"
                >
                  Limpiar filtros
                </BaseButton>

                <BaseButton
                  variant="primary"
                  type="submit"
                  size="sm"
                  class="w-full sm:w-auto"
                  :loading="isPending"
                  :leading-icon="isPending ? undefined : 'i-lucide-search'"
                >
                  Buscar
                </BaseButton>
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid gap-4 lg:grid-cols-3">
                <FormInput
                  v-model="searchDraft"
                  label="Nombre del evento"
                  name="search"
                  placeholder="Buscá por evento"
                  icon="i-lucide-search"
                  size="md"
                  :disabled="isPending"
                />

                <FormInput
                  v-model="artistDraft"
                  label="Nombre del artista"
                  name="artistName"
                  placeholder="Buscá por artista"
                  icon="i-lucide-mic-2"
                  size="md"
                  :disabled="isPending"
                />

                <FormInput
                  v-model="venueDraft"
                  label="Nombre del recinto"
                  name="venueName"
                  placeholder="Buscá por recinto"
                  icon="i-lucide-map-pin"
                  size="md"
                  :disabled="isPending"
                />
              </div>

              <div class="grid gap-4 lg:grid-cols-2">
                <FormSelect
                  label="Género"
                  name="genreId"
                  :model-value="filters.genreId || ALL_OPTION_VALUE"
                  :items="genreItems"
                  size="md"
                  :disabled="isPending"
                  @update:model-value="
                    updateFilters({
                      genreId:
                        $event === ALL_OPTION_VALUE ? '' : String($event),
                    })
                  "
                />

                <FormSelect
                  label="Ciudad"
                  name="city"
                  :model-value="filters.city || ALL_OPTION_VALUE"
                  :items="cityItems"
                  size="md"
                  :disabled="isPending"
                  @update:model-value="
                    updateFilters({
                      city: $event === ALL_OPTION_VALUE ? '' : String($event),
                    })
                  "
                />
              </div>
            </div>
          </UiPanel>
        </div>

        <section class="space-y-6">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
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

          <div v-if="showPagination" class="flex justify-center pt-1 pb-1">
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

          <div
            v-if="isPending"
            class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3"
          >
            <BaseSkeleton
              v-for="index in 6"
              :key="index"
              class="h-104 rounded-2xl"
            />
          </div>

          <div
            v-else-if="eventsErrorMessage"
            class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
          >
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

          <div
            v-else-if="events.length === 0"
            class="rounded-2xl border border-default/65 bg-default/8 px-6 py-14 text-center"
          >
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

          <div v-if="showPagination" class="flex justify-center pt-2">
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

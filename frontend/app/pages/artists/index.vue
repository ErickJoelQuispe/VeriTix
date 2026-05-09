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
  title: 'Artistas | VeriTix',
  description:
    'Explorá artistas por nombre, género, país y estado para encontrar el perfil adecuado más rápido.',
})

const searchDraft = ref(readQueryValue(route.query.search))
const countryDraft = ref(readQueryValue(route.query.country))

const filters = computed(() => ({
  search: readQueryValue(route.query.search),
  genreId: readQueryValue(route.query.genreId),
  country: readQueryValue(route.query.country),
  isActive: readQueryValue(route.query.isActive),
  page: readQueryPage(route.query.page),
}))

const { data: artistsResponse, status, error } = await usePublicArtists(filters)
const { genres } = useEventCatalogFilters()

const genreOptions = computed(() => genres.data.value ?? [])

const genreItems = computed(() => [
  { label: 'Todos los géneros', value: ALL_OPTION_VALUE },
  ...genreOptions.value.map(genre => ({
    label: genre.name,
    value: genre.id,
  })),
])

const statusItems = [
  { label: 'Todos los estados', value: ALL_OPTION_VALUE },
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
]

watch(
  () => filters.value.search,
  (value) => {
    searchDraft.value = value
  },
)

watch(
  () => filters.value.country,
  (value) => {
    countryDraft.value = value
  },
)

const artists = computed(() => artistsResponse.value?.data ?? [])
const meta = computed(
  () => artistsResponse.value?.meta ?? {
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  },
)

const selectedGenreLabel = computed(
  () => genreOptions.value.find(genre => genre.id === filters.value.genreId)?.name ?? '',
)

const resultsContext = computed(() => {
  const segments = [
    filters.value.search ? `artista: “${filters.value.search}”` : '',
    selectedGenreLabel.value ? `género: ${selectedGenreLabel.value}` : '',
    filters.value.country ? `país: ${filters.value.country}` : '',
    filters.value.isActive ? `estado: ${filters.value.isActive === 'true' ? 'activo' : 'inactivo'}` : '',
  ].filter(Boolean)

  if (segments.length === 0) {
    return 'Explorá perfiles activos, emergentes y clásicos de la cartelera.'
  }

  return segments.join(' · ')
})

const activeFilterCount = computed(
  () => [
    filters.value.search,
    filters.value.genreId,
    filters.value.country,
    filters.value.isActive,
  ].filter(Boolean).length,
)

const resultsStats = computed(() => [
  { label: 'Resultados', value: meta.value.total },
  { label: 'Página', value: `${meta.value.page}/${Math.max(meta.value.totalPages, 1)}` },
  { label: 'Filtros', value: activeFilterCount.value },
])

const isPending = computed(() => status.value === 'pending')

const artistsErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return getApiErrorMessage(
    error.value,
    'No pudimos cargar los artistas en este momento.',
  )
})

const showPagination = computed(
  () => !artistsErrorMessage.value && artists.value.length > 0 && meta.value.totalPages > 1,
)

async function updateFilters(next: Partial<typeof filters.value>) {
  const shouldResetPage = next.search !== undefined
    || next.genreId !== undefined
    || next.country !== undefined
    || next.isActive !== undefined

  const query = {
    search: next.search ?? filters.value.search,
    genreId: next.genreId ?? filters.value.genreId,
    country: next.country ?? filters.value.country,
    isActive: next.isActive ?? filters.value.isActive,
    page: shouldResetPage ? 1 : (next.page ?? filters.value.page),
  }

  await navigateTo({
    path: '/artists',
    query: {
      search: query.search || undefined,
      genreId: query.genreId || undefined,
      country: query.country || undefined,
      isActive: query.isActive || undefined,
      page: query.page > 1 ? String(query.page) : undefined,
    },
  })
}

async function submitSearch() {
  await updateFilters({
    search: searchDraft.value.trim(),
    country: countryDraft.value.trim(),
  })
}

async function clearFilters() {
  searchDraft.value = ''
  countryDraft.value = ''
  await navigateTo('/artists')
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
            eyebrow="Descubrimiento"
            title="Artistas"
            description="Explorá artistas por nombre, género, país y estado para filtrar la cartelera con rapidez."
          />

          <UiPanel
            as="form"
            variant="glass"
            radius="xl"
            padding="lg"
            class="space-y-6"
            @submit.prevent="submitSearch"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-1">
                <UiMetaLabel as="h2" tone="accent">
                  Filtros
                </UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Buscá perfiles por nombre, género o país sin perder el contexto.
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

            <div class="grid gap-4 lg:grid-cols-3">
              <FormInput
                v-model="searchDraft"
                label="Nombre del artista"
                name="search"
                placeholder="Buscá por artista"
                icon="i-lucide-search"
                size="md"
                :disabled="isPending"
                class="lg:col-span-3"
              />

              <FormInput
                v-model="countryDraft"
                label="País"
                name="country"
                placeholder="ES, MX, CO"
                icon="i-lucide-globe-2"
                size="md"
                :disabled="isPending"
              />

              <FormSelect
                label="Género"
                name="genreId"
                :model-value="filters.genreId || ALL_OPTION_VALUE"
                :items="genreItems"
                size="md"
                :disabled="isPending"
                @update:model-value="
                  updateFilters({
                    genreId: $event === ALL_OPTION_VALUE ? '' : String($event),
                  })
                "
              />

              <FormSelect
                label="Estado"
                name="isActive"
                :model-value="filters.isActive || ALL_OPTION_VALUE"
                :items="statusItems"
                size="md"
                :disabled="isPending"
                @update:model-value="
                  updateFilters({
                    isActive: $event === ALL_OPTION_VALUE ? '' : String($event),
                  })
                "
              />
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

            <div class="flex flex-wrap items-center gap-2">
              <BaseBadge v-for="stat in resultsStats" :key="stat.label" kind="info" size="sm">
                {{ stat.label }}: {{ stat.value }}
              </BaseBadge>
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

          <div v-if="isPending" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <BaseSkeleton v-for="index in 6" :key="index" class="h-104 rounded-2xl" />
          </div>

          <div
            v-else-if="artistsErrorMessage"
            class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
          >
            <div class="mx-auto flex max-w-md flex-col items-center gap-4">
              <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
              <div class="space-y-2">
                <p class="text-lg font-semibold text-highlighted">
                  No pudimos cargar los artistas.
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ artistsErrorMessage }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-else-if="artists.length === 0"
            class="rounded-2xl border border-default/65 bg-default/8 px-6 py-14 text-center"
          >
            <p class="text-lg font-semibold text-highlighted">
              No hay artistas para estos filtros.
            </p>
          </div>

          <div v-else class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <UiArtistCard
              v-for="artist in artists"
              :key="artist.id"
              :artist="artist"
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

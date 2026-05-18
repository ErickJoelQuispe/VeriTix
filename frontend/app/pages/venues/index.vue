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
  title: 'Venues | VeriTix',
  description:
    'Explorá venues por nombre, dirección, ciudad y tipo para encontrar el recinto ideal.',
})

const searchDraft = ref(readQueryValue(route.query.search))
const cityDraft = ref(readQueryValue(route.query.city))
const filtersOpen = ref(false)

const filters = computed(() => ({
  search: readQueryValue(route.query.search),
  city: readQueryValue(route.query.city),
  type: readQueryValue(route.query.type),
  page: readQueryPage(route.query.page),
}))

const { data: venuesResponse, status, error } = await usePublicVenues(filters)

watch(
  () => filters.value.search,
  (value) => {
    searchDraft.value = value
  },
)

watch(
  () => filters.value.city,
  (value) => {
    cityDraft.value = value
  },
)

const venues = computed(() => venuesResponse.value?.data ?? [])
const meta = computed(
  () => venuesResponse.value?.meta ?? {
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
  },
)

const venueTypeItems = [
  { label: 'Todos los tipos', value: ALL_OPTION_VALUE },
  { label: 'Estadio', value: 'ESTADIO' },
  { label: 'Arena', value: 'ARENA' },
  { label: 'Foro', value: 'FORO' },
  { label: 'Auditorio', value: 'AUDITORIO' },
  { label: 'Club', value: 'CLUB' },
  { label: 'Teatro', value: 'TEATRO' },
  { label: 'Al aire libre', value: 'AL_AIRE_LIBRE' },
  { label: 'Otro', value: 'OTRO' },
]

const selectedVenueTypeLabel = computed(
  () => venueTypeItems.find(item => item.value === filters.value.type)?.label ?? '',
)

const resultsContext = computed(() => {
  const segments = [
    filters.value.search ? `venue: “${filters.value.search}”` : '',
    filters.value.city ? `ciudad: ${filters.value.city}` : '',
    selectedVenueTypeLabel.value ? `tipo: ${selectedVenueTypeLabel.value}` : '',
  ].filter(Boolean)

  if (segments.length === 0) {
    return 'Explorá recintos activos y listos para próximas fechas.'
  }

  return segments.join(' · ')
})

const activeFilterCount = computed(
  () => [filters.value.search, filters.value.city, filters.value.type].filter(Boolean).length,
)

const resultsStats = computed(() => [
  { label: 'Resultados', value: meta.value.total, icon: 'i-lucide-chart-column' },
  { label: 'Página', value: `${meta.value.page}/${Math.max(meta.value.totalPages, 1)}`, icon: 'i-lucide-layers-3' },
  { label: 'Filtros', value: activeFilterCount.value, icon: 'i-lucide-sliders-horizontal' },
])

const isPending = computed(() => status.value === 'pending')

const venuesErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return getApiErrorMessage(
    error.value,
    'No pudimos cargar los venues en este momento.',
  )
})

const showPagination = computed(
  () => !venuesErrorMessage.value && venues.value.length > 0 && meta.value.totalPages > 1,
)

async function updateFilters(next: Partial<typeof filters.value>) {
  const shouldResetPage = next.search !== undefined
    || next.city !== undefined
    || next.type !== undefined

  const query = {
    search: next.search ?? filters.value.search,
    city: next.city ?? filters.value.city,
    type: next.type ?? filters.value.type,
    page: shouldResetPage ? 1 : (next.page ?? filters.value.page),
  }

  await navigateTo({
    path: '/venues',
    query: {
      search: query.search || undefined,
      city: query.city || undefined,
      type: query.type || undefined,
      page: query.page > 1 ? String(query.page) : undefined,
    },
  })
}

async function submitSearch() {
  await updateFilters({
    search: searchDraft.value.trim(),
    city: cityDraft.value.trim(),
  })
}

async function clearFilters() {
  searchDraft.value = ''
  cityDraft.value = ''
  await navigateTo('/venues')
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
            title="Venues"
            description="Explorá recintos por nombre, dirección, ciudad y tipo para afinar la búsqueda."
          />

          <UiPanel
            as="form"
            variant="glass"
            radius="xl"
            padding="lg"
            class="relative z-10 space-y-6"
            @submit.prevent="submitSearch"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div class="space-y-1">
                <UiMetaLabel as="h2" tone="accent">
                  Filtros
                </UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Buscá por nombre o dirección y afiná por ciudad o tipo.
                </p>
              </div>

              <div class="flex flex-col gap-2 lg:hidden">
                <BaseButton
                  variant="outlined"
                  type="button"
                  size="sm"
                  class="w-full"
                  :disabled="isPending"
                  leading-icon="i-lucide-sliders-horizontal"
                  @click="filtersOpen = !filtersOpen"
                >
                  Filtros ({{ activeFilterCount }})
                </BaseButton>

                <p class="text-xs leading-relaxed text-muted">
                  <span v-if="activeFilterCount">
                    {{ activeFilterCount }} filtro{{ activeFilterCount === 1 ? '' : 's' }} activo{{ activeFilterCount === 1 ? '' : 's' }}
                  </span>
                  <span v-else>
                    Sin filtros activos.
                  </span>
                </p>
              </div>

              <div class="hidden gap-2 lg:flex">
                <BaseButton
                  variant="primary"
                  type="submit"
                  size="sm"
                  class="w-full sm:w-auto order-first"
                  :loading="isPending"
                  :leading-icon="isPending ? undefined : 'i-lucide-search'"
                >
                  Buscar
                </BaseButton>

                <BaseButton
                  variant="reversed"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="isPending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="clearFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>

            </div>

            <div class="space-y-6 lg:block" :class="filtersOpen ? 'block' : 'hidden'">
              <div class="grid gap-4 lg:grid-cols-2">
                <FormInput
                  v-model="searchDraft"
                  label="Nombre o dirección"
                  name="search"
                  placeholder="Buscá por venue o dirección"
                  icon="i-lucide-search"
                  size="md"
                  :disabled="isPending"
                  class="lg:col-span-2"
                />

                <FormInput
                  v-model="cityDraft"
                  label="Ciudad"
                  name="city"
                  placeholder="Granada, CDMX, Bogotá"
                  icon="i-lucide-map-pin"
                  size="md"
                  :disabled="isPending"
                />

                <FormSelect
                  label="Tipo"
                  name="type"
                  :model-value="filters.type || ALL_OPTION_VALUE"
                  :items="venueTypeItems"
                  :placeholder-value="ALL_OPTION_VALUE"
                  icon="i-lucide-building-2"
                  size="md"
                  :disabled="isPending"
                  @update:model-value="
                    updateFilters({
                      type: $event === ALL_OPTION_VALUE ? '' : String($event),
                    })
                  "
                />
              </div>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center lg:hidden">
                <BaseButton
                  variant="primary"
                  type="submit"
                  size="sm"
                  class="w-full sm:w-auto order-first"
                  :loading="isPending"
                  :leading-icon="isPending ? undefined : 'i-lucide-search'"
                >
                  Buscar
                </BaseButton>

                <BaseButton
                  variant="reversed"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="isPending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="clearFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>
          </UiPanel>
        </div>

        <section class="space-y-6">
          <div class="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div class="space-y-1 sm:text-left">
              <UiMetaLabel tone="accent">
                Resultados
              </UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                {{ resultsContext }}
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <BaseBadge
                v-for="stat in resultsStats"
                :key="stat.label"
                kind="tag"
                color="primary"
                size="sm"
                :icon="stat.icon"
                class="min-w-28 justify-center rounded-full"
              >
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
            <BaseSkeleton v-for="index in 6" :key="index" class="h-96 rounded-2xl" />
          </div>

          <div
            v-else-if="venuesErrorMessage"
            class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
          >
            <div class="mx-auto flex max-w-md flex-col items-center gap-4">
              <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
              <div class="space-y-2">
                <p class="text-lg font-semibold text-highlighted">
                  No pudimos cargar los venues.
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ venuesErrorMessage }}
                </p>
              </div>
            </div>
          </div>

          <UiPanel v-else-if="venues.length === 0" variant="glass" radius="xl" padding="xl">
            <UiEmptyState
              icon="i-lucide-building-2"
              title="No hay venues para estos filtros."
              description="Probá limpiar filtros o ajustar la búsqueda para ver más resultados."
            />
          </UiPanel>

          <div v-else class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            <UiVenueCard
              v-for="venue in venues"
              :key="venue.id"
              :venue="venue"
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

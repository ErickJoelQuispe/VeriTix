<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type {
  BackofficeEventRecord,
  BackofficeOption,
  BackofficeRequiresAttentionRecord,
  GenreOption,
} from '~~/shared/types'
import type {
  CatalogEventListItem,
  CatalogMode,
  QuickWindow,
} from '@/utils/backoffice/eventsCatalog'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'
import {
  buildCatalogSummary,
  CATALOG_MODE_ITEMS,
  createCatalogListItems,
  getEventStatusColor,
  isCatalogMode,
  isQuickWindow,
  QUICK_WINDOW_OPTIONS,
} from '@/utils/backoffice/eventsCatalog'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Operaciones de eventos | VeriTix' })

const { deleteEvent: deleteBackofficeEvent, getFormOptions, listCatalog, listRequiresAttention } = useBackofficeEventsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const catalogEvents = ref<BackofficeEventRecord[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<BackofficeOption[]>([])
const requiresAttention = ref<BackofficeRequiresAttentionRecord[]>([])

const dashboardPending = ref(true)
const catalogPending = ref(true)
const filtersPending = ref(true)
const deletingEventId = ref('')
const catalogMode = ref<CatalogMode>('published')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS
const quickWindow = ref<QuickWindow>('all')

const meta = ref<PaginationMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
})

const filters = reactive({
  search: '',
  city: '',
  genreId: '',
  formatId: '',
  dateFrom: '',
  dateTo: '',
  artistName: '',
})

const quickWindowItems = computed(() => {
  return QUICK_WINDOW_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  }))
})

function setQuickWindow(value: string) {
  if (isQuickWindow(value)) {
    quickWindow.value = value
  }
}

const priorityIssueCount = computed(() => {
  return requiresAttention.value.reduce((total, event) => total + event.issues.length, 0)
})

const catalogSummary = computed(() => {
  return buildCatalogSummary({
    catalogMode: catalogMode.value,
    requiresAttentionCount: requiresAttention.value.length,
    meta: meta.value,
  })
})

const toolbarChips = computed(() => {
  const publishedCount = catalogEvents.value.filter(event => event.status === 'PUBLISHED').length
  const draftCount = catalogEvents.value.filter(event => event.status === 'DRAFT').length

  return [
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-chart-column' },
    { label: 'publicados', value: publishedCount, icon: 'i-lucide-badge-check' },
    { label: 'borradores', value: draftCount, icon: 'i-lucide-file-pen-line' },
    { label: 'alertas', value: priorityIssueCount.value, icon: 'i-lucide-triangle-alert' },
  ]
})

const catalogListItems = computed<CatalogEventListItem[]>(() => {
  return createCatalogListItems({
    catalogMode: catalogMode.value,
    catalogEvents: catalogEvents.value,
    requiresAttention: requiresAttention.value,
  })
})

async function loadFilterOptions() {
  filtersPending.value = true

  try {
    const options = await getFormOptions()

    genres.value = options.genres
    formats.value = options.formats
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los filtros operativos.', { id: 'admin-events-filters-error' })
  }
  finally {
    filtersPending.value = false
  }
}

async function loadCatalog(targetPage = page.value) {
  catalogPending.value = true

  try {
    const response = await listCatalog({
      pageValue: targetPage,
      pageSize: pageSize.value,
      filters,
      quickWindow: quickWindow.value,
    })

    catalogEvents.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar el catálogo publicado.', { id: 'admin-events-catalog-error' })
  }
  finally {
    catalogPending.value = false
  }
}

async function loadDashboard() {
  dashboardPending.value = true

  try {
    requiresAttention.value = await listRequiresAttention()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar el panel operativo de eventos.', { id: 'admin-events-dashboard-error' })
  }
  finally {
    dashboardPending.value = false
  }
}

async function refreshDashboard() {
  await Promise.all([loadDashboard(), loadCatalog(page.value)])
}

async function removeEvent(eventId: string) {
  deletingEventId.value = eventId

  try {
    await deleteBackofficeEvent(eventId)

    notifySuccess('Evento cancelado correctamente.', { id: `admin-events-delete-${eventId}` })
    await refreshDashboard()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cancelar el evento.', { id: `admin-events-delete-error-${eventId}` })
  }
  finally {
    deletingEventId.value = ''
  }
}

function applyCatalogFilters() {
  page.value = 1

  if (catalogMode.value === 'review') {
    void refreshDashboard()
    return
  }

  void loadCatalog(1)
}

function resetCatalogFilters() {
  filters.search = ''
  filters.city = ''
  filters.genreId = ''
  filters.formatId = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.artistName = ''
  pageSize.value = 12
  quickWindow.value = 'all'
  page.value = 1

  if (catalogMode.value === 'review') {
    void refreshDashboard()
    return
  }

  void loadCatalog(1)
}

function formatEventDate(value: string | null | undefined) {
  if (!value) {
    return 'Sin fecha definida'
  }

  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function goToCatalogPage(nextPage: number) {
  void loadCatalog(nextPage)
}

function setCatalogMode(value: string) {
  if (isCatalogMode(value)) {
    catalogMode.value = value
  }
}

onMounted(() => {
  void Promise.all([loadFilterOptions(), loadDashboard(), loadCatalog()])
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-events-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Manage events"
          description="Search, filter, and update event records with a compact overview."
          action-label="Nuevo evento"
          action-to="/backoffice/events/new"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Vista operativa de eventos"
          description="Filtrá el catálogo, alterná la vista y seguí las alertas desde un solo panel."
          variant="glass"
        >
          <template #actions>
            <div class="flex items-center gap-3 sm:self-center">
              <BaseButton
                variant="outlined"
                size="md"
                :disabled="catalogPending || filtersPending"
                @click="resetCatalogFilters"
              >
                Resetear
              </BaseButton>
              <BaseButton
                variant="primary"
                size="md"
                :loading="catalogPending || filtersPending"
                @click="applyCatalogFilters"
              >
                Aplicar
              </BaseButton>
            </div>
          </template>

          <div class="space-y-6">
            <PagesBackofficeFiltersBar
              v-model:search="filters.search"
              v-model:city="filters.city"
              v-model:genre-id="filters.genreId"
              v-model:format-id="filters.formatId"
              v-model:date-from="filters.dateFrom"
              v-model:date-to="filters.dateTo"
              v-model:artist-name="filters.artistName"
              v-model:page-size="pageSize"
              :genres="genres"
              :formats="formats"
              :page-size-options="pageSizeOptions"
              city-placeholder="Escribí una ciudad"
              artist-placeholder="Nombre del artista"
              :loading="catalogPending || filtersPending"
              :visible-filters="catalogMode === 'published' ? ['city', 'artistName', 'pageSize', 'genre', 'format', 'dateRange'] : ['city']"
              search-label="Buscar evento"
              search-placeholder="Nombre del evento"
              class="w-full"
            />

            <div class="flex flex-wrap gap-2.5">
              <BaseBadge
                v-for="item in toolbarChips"
                :key="item.label"
                kind="tag"
                color="primary"
                size="sm"
                :icon="item.icon"
                class="min-w-28 justify-center rounded-full"
              >
                {{ item.label }}: {{ item.value }}
              </BaseBadge>
            </div>

            <div class="rounded-2xl border border-default/70 bg-elevated/35 p-3 text-sm text-toned sm:p-4">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-default/70 bg-elevated/80 p-1">
                  <BaseButton
                    v-for="item in CATALOG_MODE_ITEMS"
                    :key="item.value"
                    variant="outlined"
                    size="md"
                    :leading-icon="item.icon"
                    class="min-w-0 border-transparent shadow-none transition-all duration-200"
                    :class="catalogMode === item.value
                      ? 'border-primary/45! bg-primary/20 text-highlighted shadow-sm ring-1 ring-primary/30 hover:bg-primary/24 hover:ring-primary/40'
                      : 'text-toned hover:-translate-y-px hover:border-default/55 hover:bg-default/70 hover:text-highlighted hover:shadow-sm'"
                    :aria-current="catalogMode === item.value ? 'page' : undefined"
                    @click="setCatalogMode(item.value)"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span>{{ item.label }}</span>
                      <span
                        v-if="catalogMode === item.value"
                        aria-hidden="true"
                        class="h-1.5 w-3 rounded-full bg-primary/90"
                      />
                    </span>
                  </BaseButton>
                </div>

                <div
                  v-if="catalogMode === 'published'"
                  class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-default/70 bg-elevated/80 p-1"
                >
                  <BaseButton
                    v-for="item in quickWindowItems"
                    :key="item.value"
                    variant="outlined"
                    size="md"
                    class="min-w-0 border-transparent shadow-none transition-all duration-200"
                    :class="quickWindow === item.value
                      ? 'border-primary/45! bg-primary/20 text-highlighted shadow-sm ring-1 ring-primary/30 hover:bg-primary/24 hover:ring-primary/40'
                      : 'text-toned hover:-translate-y-px hover:border-default/55 hover:bg-default/70 hover:text-highlighted hover:shadow-sm'"
                    :aria-current="quickWindow === item.value ? 'page' : undefined"
                    @click="setQuickWindow(item.value)"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span>{{ item.label }}</span>
                      <span
                        v-if="quickWindow === item.value"
                        aria-hidden="true"
                        class="h-1.5 w-3 rounded-full bg-primary/90"
                      />
                    </span>
                  </BaseButton>
                </div>
              </div>
            </div>

            <div v-if="catalogMode === 'published'" class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
              <div class="flex w-full flex-wrap items-center justify-center">
                <BasePagination
                  :page="meta.page"
                  :total="meta.total"
                  :items-per-page="meta.limit"
                  :disabled="catalogPending"
                  :sibling-count="1"
                  :show-edges="meta.totalPages > 5"
                  size="lg"
                  @update:page="goToCatalogPage"
                />
              </div>
            </div>

            <div v-if="catalogMode === 'review'" class="flex flex-col gap-3 border-y border-default/70 py-3 text-sm text-toned sm:flex-row sm:items-center sm:justify-between">
              <p class="font-medium text-highlighted">
                {{ catalogSummary }}
              </p>
              <BaseBadge kind="info" size="sm">
                {{ priorityIssueCount }} alertas
              </BaseBadge>
            </div>

            <div class="space-y-4">
              <template v-if="catalogMode === 'published' && catalogPending">
                <BaseSkeleton v-for="i in 4" :key="`catalog-${i}`" class="h-32 rounded-2xl" />
              </template>

              <UiEmptyState
                v-else-if="catalogMode === 'review' && requiresAttention.length === 0"
                icon="i-lucide-shield-check"
                title="Sin eventos por revisar"
                description="No hay incidencias activas ahora mismo."
              />

              <UiEmptyState
                v-else-if="catalogMode === 'published' && catalogEvents.length === 0"
                icon="i-lucide-search-x"
                title="Sin resultados publicados"
                description="Prueba con otros filtros."
              />

              <UiPanel
                v-for="event in catalogListItems"
                v-else
                :key="event.id"
                variant="glass"
                interactive
                padding="md"
                radius="lg"
                class="group flex flex-col gap-4 border-default/65! bg-elevated/25! sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 items-center gap-4 sm:gap-5">
                  <div class="flex size-16 shrink-0 self-center items-center justify-center overflow-hidden rounded-xl border border-default/60 bg-default/50">
                    <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" class="size-full object-cover">
                    <BaseIcon v-else name="i-lucide-calendar-range" class="size-5 text-muted" />
                  </div>

                  <div class="min-w-0 space-y-2.5">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <p class="truncate text-base font-semibold text-highlighted">
                        <NuxtLink
                          v-if="event.to"
                          :to="event.to"
                          class="rounded-sm transition-colors duration-150 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
                        >
                          {{ event.title }}
                        </NuxtLink>
                        <span v-else>{{ event.title }}</span>
                      </p>

                      <BaseBadge kind="status" :color="getEventStatusColor(event.status)" size="sm">
                        {{ event.status }}
                      </BaseBadge>
                      <BaseBadge v-if="event.formatName" kind="tag" size="sm">
                        {{ event.formatName }}
                      </BaseBadge>
                      <BaseBadge v-if="event.isReview" kind="info" size="sm">
                        Revisión
                      </BaseBadge>
                      <BaseBadge v-if="event.isReview" kind="status" color="warning" size="sm">
                        {{ event.issues.length }} alertas
                      </BaseBadge>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-toned">
                      <div class="flex items-center gap-2.5">
                        <BaseIcon name="i-lucide-clock-3" class="size-4 shrink-0 text-muted" />
                        <span>{{ formatEventDate(event.eventDate) }}</span>
                      </div>

                      <div v-if="event.venueName || event.venueCity" class="flex min-w-0 items-center gap-2.5">
                        <BaseIcon name="i-lucide-map-pin" class="size-4 shrink-0 text-muted" />
                        <span class="truncate">{{ event.venueName }}<template v-if="event.venueName && event.venueCity"> · </template>{{ event.venueCity }}</span>
                      </div>
                    </div>

                    <div v-if="event.isReview && event.issues.length > 0" class="pt-1">
                      <p class="flex items-start gap-2 text-sm text-toned">
                        <BaseIcon name="i-lucide-triangle-alert" class="mt-0.5 size-4 shrink-0 text-warning" />
                        <span>
                          {{ event.issues.join(' · ') }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex shrink-0 flex-wrap items-center justify-start gap-2.5 pt-1 sm:justify-end sm:pt-0">
                  <BaseButton variant="secondary" size="sm" class="rounded-md! border-default/55 bg-default/55 hover:bg-default/70" :to="event.to">
                    Editar
                  </BaseButton>
                  <PagesBackofficeDeleteAction
                    v-if="!event.isReview"
                    item-label="el evento"
                    trigger-variant="secondary"
                    trigger-class="!rounded-md border-error/35 text-error hover:border-error/50 hover:bg-error/12 hover:text-error"
                    :pending="deletingEventId === event.id"
                    @confirm="removeEvent(event.id)"
                  />
                </div>
              </UiPanel>
            </div>

            <div v-if="catalogMode === 'published'" class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
              <div class="flex w-full flex-wrap items-center justify-center">
                <BasePagination
                  :page="meta.page"
                  :total="meta.total"
                  :items-per-page="meta.limit"
                  :disabled="catalogPending"
                  :sibling-count="1"
                  :show-edges="meta.totalPages > 5"
                  size="lg"
                  @update:page="goToCatalogPage"
                />
              </div>
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>

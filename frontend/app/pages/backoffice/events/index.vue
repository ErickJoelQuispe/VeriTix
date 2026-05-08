<script setup lang="ts">
import type {
  BackofficeEventRecord,
  BackofficeOption,
  BackofficeRequiresAttentionRecord,
  GenreOption,
  PaginationMeta,
} from '~~/shared/types'
import type {
  CatalogEventListItem,
  CatalogMode,
  QuickWindow,
} from '@/utils/backoffice/eventsCatalog'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'
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

const quickWindowOptions = QUICK_WINDOW_OPTIONS

const quickWindowItems = computed(() => {
  return quickWindowOptions.map(option => ({
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

const catalogModeItems = computed(() => {
  return CATALOG_MODE_ITEMS
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
    { label: 'visibles', value: meta.value.total },
    { label: 'publicados', value: publishedCount },
    { label: 'borradores', value: draftCount },
    { label: 'alertas', value: priorityIssueCount.value },
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
  quickWindow.value = 'all'
  page.value = 1

  if (catalogMode.value === 'review') {
    void refreshDashboard()
    return
  }

  void loadCatalog(1)
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
  <BackofficePageShell
    title="Manage events"
    description="Search, filter, and update event records with a compact overview."
    primary-action-to="/backoffice/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="backoffice-events-page">
      <section class="grid gap-3 rounded-2xl border border-default/70 bg-elevated/45 p-4 md:grid-cols-[1.25fr_.72fr_.72fr_auto]">
        <FormInput v-model="filters.search" placeholder="Search title, venue, city" icon="i-lucide-search" :disabled="catalogPending || filtersPending" />
        <FormSelect label="Status" name="status" :model-value="catalogMode" :items="catalogModeItems.map(item => ({ label: item.label, value: item.value }))" :disabled="catalogPending || filtersPending" @update:model-value="setCatalogMode(String($event))" />
        <FormSelect label="Window" name="window" :model-value="quickWindow" :items="quickWindowItems" :disabled="catalogPending || filtersPending" @update:model-value="setQuickWindow(String($event))" />
        <BaseButton variant="secondary" :loading="catalogPending || filtersPending" @click="applyCatalogFilters">
          Search
        </BaseButton>
      </section>

      <BackofficeOverviewPanel
        eyebrow="Filter"
        :title="catalogMode === 'review' ? 'Refine list.' : 'Refine list.'"
        tone="subtle"
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
          <BackofficeFiltersBar
            v-model:search="filters.search"
            v-model:city="filters.city"
            v-model:genre-id="filters.genreId"
            v-model:format-id="filters.formatId"
            v-model:date-from="filters.dateFrom"
            v-model:date-to="filters.dateTo"
            v-model:artist-name="filters.artistName"
            :genres="genres"
            :formats="formats"
            :loading="catalogPending || filtersPending"
            :visible-filters="catalogMode === 'published' ? ['city', 'artistName', 'genre', 'format', 'dateRange'] : ['city']"
            class="w-full"
          />

          <BackofficeToolbarChips :items="toolbarChips" />

          <div class="rounded-2xl border border-default/70 bg-elevated/35 p-3 text-sm text-toned sm:p-4">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <BackofficeSegmentedControl
                :items="catalogModeItems"
                :active-value="catalogMode"
                size="md"
                @select="setCatalogMode"
              />

              <div
                v-if="catalogMode === 'published'"
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4"
              >
                <BackofficeSegmentedControl
                  :items="quickWindowItems"
                  :active-value="quickWindow"
                  size="md"
                  @select="setQuickWindow"
                />
              </div>
            </div>
          </div>

          <BackofficePaginationRail
            v-if="catalogMode === 'published'"
            :page="meta.page"
            :total="meta.total"
            :items-per-page="meta.limit"
            :pending="catalogPending"
            :show-edges="meta.totalPages > 5"
            @update:page="goToCatalogPage"
          />

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

            <BackofficeEventRow
              v-for="event in catalogListItems"
              v-else
              :key="event.id"
              :title="event.title"
              :to="event.to"
              :event-date="event.eventDate"
              :venue-name="event.venueName"
              :venue-city="event.venueCity"
              :image-url="event.imageUrl"
              :status="event.isReview ? '' : event.status"
            >
              <template #badges>
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
              </template>

              <template #details>
                <p v-if="event.isReview && event.issues.length > 0" class="flex items-start gap-2 text-sm text-toned">
                  <BaseIcon name="i-lucide-alert-triangle" class="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>
                    {{ event.issues.join(' · ') }}
                  </span>
                </p>
              </template>

              <template #actions>
                <BaseButton variant="secondary" size="sm" class="!rounded-md border-default/55 bg-default/55 hover:bg-default/70" :to="event.to">
                  Editar
                </BaseButton>
                <BackofficeDeleteAction
                  v-if="!event.isReview"
                  item-label="el evento"
                  trigger-variant="secondary"
                  trigger-class="!rounded-md border-error/35 text-error hover:border-error/50 hover:bg-error/12 hover:text-error"
                  :pending="deletingEventId === event.id"
                  @confirm="removeEvent(event.id)"
                />
              </template>
            </BackofficeEventRow>
          </div>

          <BackofficePaginationRail
            v-if="catalogMode === 'published'"
            :page="meta.page"
            :total="meta.total"
            :items-per-page="meta.limit"
            :pending="catalogPending"
            :show-edges="meta.totalPages > 5"
            @update:page="goToCatalogPage"
          />
        </div>
      </BackofficeOverviewPanel>
    </div>
  </BackofficePageShell>
</template>

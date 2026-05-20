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
import {
  buildCatalogSummary,
  CATALOG_MODE_ITEMS,
  createCatalogListItems,
  getEventStatusColor,
  isCatalogMode,
  isQuickWindow,
  QUICK_WINDOW_OPTIONS,
} from '@/utils/backoffice/eventsCatalog'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'

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
const deletingTarget = ref('')
const deleteModalOpen = ref(false)
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

const filtersOpen = ref(false)

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

function confirmDelete(eventId: string) {
  deletingTarget.value = eventId
  deleteModalOpen.value = true
}

function handleDeleteConfirm() {
  if (deletingTarget.value) {
    removeEvent(deletingTarget.value)
  }

  deleteModalOpen.value = false
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
          variant="glass"
        >
          <template #actions>
            <div class="flex items-center gap-3 sm:self-center">
              <BaseButton
                variant="outlined"
                size="sm"
                class="lg:hidden"
                leading-icon="i-lucide-sliders-horizontal"
                @click="filtersOpen = !filtersOpen"
              >
                {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
              </BaseButton>

              <div class="hidden gap-3 lg:flex">
                <BaseButton
                  variant="primary"
                  size="md"
                  :loading="catalogPending || filtersPending"
                  @click="applyCatalogFilters"
                >
                  Buscar
                </BaseButton>
                <BaseButton
                  variant="reversed"
                  size="md"
                  :disabled="catalogPending || filtersPending"
                  @click="resetCatalogFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>
          </template>

          <template #summary>
            <div class="flex flex-wrap items-center gap-2.5">
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
          </template>

          <div class="space-y-6">
            <div class="space-y-6 lg:block" :class="[filtersOpen ? 'block' : 'hidden']">
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

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center lg:hidden">
                <BaseButton
                  variant="primary"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto order-first"
                  :loading="catalogPending || filtersPending"
                  :leading-icon="catalogPending || filtersPending ? undefined : 'i-lucide-search'"
                  @click="applyCatalogFilters"
                >
                  Buscar
                </BaseButton>

                <BaseButton
                  variant="reversed"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="catalogPending || filtersPending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="resetCatalogFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>

            <div class="rounded-2xl border border-default/70 bg-elevated/35 p-3 sm:p-4">
              <div class="flex flex-col gap-3.5 lg:flex-row lg:items-start lg:justify-between">
                <div class="space-y-1 lg:min-w-0 lg:flex-1">
                  <UiMetaLabel tone="accent">
                    Catálogo
                  </UiMetaLabel>

                  <div class="mt-4 flex flex-wrap gap-2.5">
                    <BaseButton
                      v-for="item in CATALOG_MODE_ITEMS"
                      :key="item.value"
                      variant="outlined"
                      size="sm"
                      :leading-icon="item.icon"
                      class="min-w-0 rounded-full! border-default/45 bg-transparent px-4 py-2.5 text-sm normal-case tracking-normal shadow-none transition-all duration-200"
                      :class="catalogMode === item.value
                        ? 'border-lavender/45! bg-lavender/14 text-highlighted ring-1 ring-lavender/25 shadow-[inset_0_0_0_1px_rgba(156,125,255,0.16)] hover:bg-lavender/18 hover:ring-lavender/35'
                        : 'text-toned/75 hover:-translate-y-px hover:border-lavender/25 hover:bg-lavender/6 hover:text-highlighted'"
                      :aria-current="catalogMode === item.value ? 'page' : undefined"
                      @click="setCatalogMode(item.value)"
                    >
                      <span class="inline-flex items-center gap-2">
                        <span>{{ item.label }}</span>
                        <span
                          v-if="catalogMode === item.value"
                          aria-hidden="true"
                          class="size-1.5 rounded-full bg-lavender"
                        />
                      </span>
                    </BaseButton>
                  </div>
                </div>

                <div v-if="catalogMode === 'published'" class="space-y-1 lg:min-w-0 lg:flex-1 lg:text-right">
                  <p class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-toned/60">
                    Ventana
                  </p>

                  <div class="mt-4 flex flex-wrap gap-2.5 lg:justify-end">
                    <BaseButton
                      v-for="item in quickWindowItems"
                      :key="item.value"
                      variant="outlined"
                      size="sm"
                      class="min-w-0 rounded-full! border-default/45 bg-transparent px-4 py-2.5 text-sm normal-case tracking-normal shadow-none transition-all duration-200"
                      :class="quickWindow === item.value
                        ? 'border-lavender/45! bg-lavender/14 text-highlighted ring-1 ring-lavender/25 shadow-[inset_0_0_0_1px_rgba(156,125,255,0.16)] hover:bg-lavender/18 hover:ring-lavender/35'
                        : 'text-toned/75 hover:-translate-y-px hover:border-lavender/25 hover:bg-lavender/6 hover:text-highlighted'"
                      :aria-current="quickWindow === item.value ? 'page' : undefined"
                      @click="setQuickWindow(item.value)"
                    >
                      <span class="inline-flex items-center gap-2">
                        <span>{{ item.label }}</span>
                        <span
                          v-if="quickWindow === item.value"
                          aria-hidden="true"
                          class="size-1.5 rounded-full bg-lavender"
                        />
                      </span>
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="catalogMode === 'published'" class="flex justify-center pt-1 pb-1">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="catalogPending"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="goToCatalogPage"
              />
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
                class="group relative flex flex-row items-center gap-2.5 overflow-hidden border-default/65! bg-elevated/25! sm:gap-3"
              >
                <div class="relative size-20 shrink-0 self-center overflow-hidden rounded-xl border border-default/60 bg-default/50 sm:size-20 md:size-24">
                  <img v-if="event.imageUrl" :src="event.imageUrl" :alt="event.title" class="size-full object-cover">
                  <div v-else class="flex size-full items-center justify-center">
                    <BaseIcon name="i-lucide-calendar-range" class="size-5 text-muted sm:size-6" />
                  </div>
                </div>

                <div class="absolute right-3 top-3 z-10">
                  <BaseBadge kind="status" :color="getEventStatusColor(event.status)" size="sm">
                    {{ event.status }}
                  </BaseBadge>
                </div>

                <div class="grid min-w-0 flex-1 gap-2 py-0.5 pr-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-3 sm:pr-2">
                  <div class="min-w-0 space-y-1.5">
                    <div class="flex min-w-0 items-start gap-2 sm:pr-0.5">
                      <p class="min-w-0 flex-1 truncate text-base font-semibold leading-tight text-highlighted sm:text-lg">
                        <NuxtLink
                          v-if="event.to"
                          :to="event.to"
                          class="block truncate rounded-sm transition-colors duration-150 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/35"
                        >
                          {{ event.title }}
                        </NuxtLink>
                        <span v-else class="block truncate">{{ event.title }}</span>
                      </p>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
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

                    <div class="flex flex-col gap-1.5 text-sm text-toned sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3.5 sm:gap-y-1">
                      <div class="flex items-center gap-2">
                        <BaseIcon name="i-lucide-clock-3" class="size-4 shrink-0 text-muted" />
                        <span>{{ formatEventDate(event.eventDate) }}</span>
                      </div>

                      <div v-if="event.venueName || event.venueCity" class="flex min-w-0 items-center gap-2">
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

                  <div class="pt-0.5 sm:flex sm:self-stretch sm:flex-col sm:items-end sm:justify-end sm:pl-2 sm:pt-0">
                    <div class="flex flex-wrap gap-1.5 sm:items-center sm:justify-end sm:gap-2">
                      <BaseButton
                        variant="outlined"
                        size="sm"
                        class="sm:w-28"
                        :to="event.to"
                      >
                        Editar
                      </BaseButton>
                      <BaseButton
                        v-if="!event.isReview"
                        variant="danger"
                        size="sm"
                        class="w-full sm:w-28 justify-center"
                        :disabled="deletingEventId === event.id"
                        @click="confirmDelete(event.id)"
                      >
                        Cancelar
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </UiPanel>
            </div>

            <div v-if="catalogMode === 'published'" class="flex justify-center pt-1 pb-1">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="catalogPending"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="goToCatalogPage"
              />
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>

    <UiConfirmModal
      :open="deleteModalOpen"
      title="Cancelar evento"
      description="¿Estás seguro de que querés cancelar este evento? Esta acción no se puede deshacer."
      confirm-label="Cancelar evento"
      cancel-label="Volver"
      :pending="deletingEventId === deletingTarget"
      @confirm="handleDeleteConfirm"
      @cancel="deleteModalOpen = false; deletingTarget = ''"
    />
  </section>
</template>
